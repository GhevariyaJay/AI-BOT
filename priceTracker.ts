import { prisma } from "./prisma";
import { getPortfolio } from "./getPortfolio";
import type { Account } from "./accounts";

setInterval(async () => {
    const models = await prisma.models.findMany();
    for (const model of models) {
        const portfolio = await getPortfolio({
            apiKey: model.lighterApiKey,
            modelName: model.OpenRoutermodelName,
            name: model.name,
            id: model.id,
            accountIndex: model.accountIndex,
        });
        await prisma.portfolioSize.create({
            where: {
                modelId: model.id
            },
            update: {
                size: portfolio
            },
            create: {
                modelId: model.id,
                size: portfolio
            }
        });
    }
}, 1000);
