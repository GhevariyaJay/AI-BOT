import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import { z } from 'zod';

import { PROMPT } from './prompt';
import { getIndicators } from './stockData';
import { getOpenPositions } from './openPostions';
import type { Account } from './accounts';
import { createPosition, MARKETS } from './createOrder';
import { cancelOrder } from './cancelOrder';
import { PrismaClient, ToolCallType } from './generated/prisma/client';
import { getPortfolio } from './getPortfolio';

const prisma = new PrismaClient();

export const invokeLLM = async (account: Account) => {
  const openRouter = createOpenRouter({
    apiKey: account.apiKey,
  });

  let allIndicatorData = '';

  await Promise.all(
    Object.values(MARKETS).map(async (market) => {
      const intradayIndicators = await getIndicators('5m', market.marketId);
      const longTermIndicators = await getIndicators('4h', market.marketId);

      allIndicatorData += `
MARKET = ${market.symbol ?? JSON.stringify(market)}
Intraday (5m) (oldest -> latest):
Mid Prices - ${intradayIndicators.midPrices.join(', ')}
EMA20 = ${intradayIndicators.ema20.join(', ')}
MACD = ${intradayIndicators.macd.join(', ')}

Long Term (4h) (oldest -> latest):
Mid Prices - ${longTermIndicators.midPrices.join(', ')}
EMA20 = ${longTermIndicators.ema20.join(', ')}
MACD = ${longTermIndicators.macd.join(', ')}

`;
    })
  );

  const intradayIndicators = await getIndicators('5m', 0);
  const portfolio = await getPortfolio(account);
  const openPositions = await getOpenPositions(account.apiKey);

  const modelInvocation = await prisma.invocations.create({
    data: {
      modelId: account.id,
      response: '',
    },
  });

  const result = streamText({
    model: openRouter(account.model),
    prompt: PROMPT
      .replace('{{INVOKATION_TIMES}}', String(account.invocationCount ?? 0))
      .replace(
        '{{OPEN_POSITIONS}}',
        openPositions?.map((position) => `${position.symbol}: ${position.position} (${position.sign})`).join(', ') ?? ''
      )
      .replace('{{PORTFOLO_VALUE}}', String(portfolio))
      .replace('{{ALL_INTRADAY_INDICATORS_DATA}}', allIndicatorData)
      .replace('{{AVAILABLE_CASH}}', String(portfolio))
      .replace('{{CURRENT_ACCOUNT_POSITIONS}}', JSON.stringify(openPositions))
      .replace('{{EMA20}}', intradayIndicators.ema20.join(', '))
      .replace('{{MACD}}', intradayIndicators.macd.join(', ')),
    tools: {
      openPosition: {
        description: 'Open a new trading position for the account',
        parameters: z.object({
          quantity: z.number().describe('The quantity to open'),
          symbol: z.enum(Object.keys(MARKETS) as [string, ...string[]]).describe('The symbol to trade'),
          side: z.enum(['long', 'short']).describe('The side of the position'),
        }),
        execute: async ({ symbol, side, quantity }) => {
          await createPosition(account, symbol, side, quantity);

          await prisma.toolCalls.create({
            data: {
              invocationId: modelInvocation.id,
              toolCallType: ToolCallType.CREATE_POSITION,
              metadata: JSON.stringify({ symbol, side, quantity }),
            },
          });

          return `Position opened successfully for account ${account.name}.`;
        },
      },

      closeAllPositions: {
        description: 'Close all open positions for the account',
        parameters: z.object({}),
        execute: async () => {
          await cancelOrder(account);

          await prisma.toolCalls.create({
            data: {
              invocationId: modelInvocation.id,
              toolCallType: ToolCallType.CLOSE_POSITION,
              metadata: JSON.stringify({ accountId: account.id }),
            },
          });

          return `All positions closed successfully for account ${account.name}.`;
        },
      },
    },
  });

  await result.consumeStream();
  const text = (await result.text).trim();

  await prisma.invocations.update({
    where: {
      id: modelInvocation.id,
    },
    data: {
      response: text,
    },
  });

  return text;
};

async function main() {
  const models = await prisma.models.findMany();

  for (const model of models) {
    await invokeLLM({
      apiKey: model.lighterApiKey,
      name: model.name,
      invocationCount: model.invocationCount,
      id: model.id,
      model: model.modelName,
    } as Account);
  }
}

setInterval(() => {
  void main();
}, 1000 * 60 * 5);