
export interface Account {
    apiKey: string;
    name: string;
    model: string;
    id: string;
    invocationCount: number;
    accountIndex: number;
}

export const SUPPORTED_ACCOUNTS : Account[] = [{
    apiKey: process.env.API_KEY_CLAUDE,
    name: 'Claude',
    model: '/anthropic/claude-3-5-sonnet'
},
{
    apiKey: process.env.API_KEY_OPENAI,
    name: 'OpenAI',
    model: '/openai/gpt-4'
},
{
    apiKey: process.env.API_KEY_QWEN,
    name: 'Qwen',
    model: '/qwen/qwen3-235b-chat'
}]