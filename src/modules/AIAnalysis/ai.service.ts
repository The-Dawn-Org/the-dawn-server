import 'dotenv/config';
import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

interface FruitNutrition {
    fruit: string;
    serving_size: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    nutrients: {
        fiber_percent: number;
        vitamin_c_percent: number;
        potassium_percent: number;
        calcium_percent: number;
        iron_percent: number;
        vitamin_a_percent: number;
    };
}

@Injectable()
export class AiService {
    private readonly client: OpenAI;

//     private readonly systemPrompt = `
// You are an AI assistant inside a web application.

// Always format your responses using Markdown.

// Formatting rules:
// - Use headings when they make the answer easier to understand.
// - Use bullet points for lists.
// - Use numbered lists for sequential instructions.
// - Use **bold** for important information.
// - Use *italics* sparingly.
// - Use \`inline code\` for code, commands, filenames, variables, etc.
// - Use fenced code blocks for multi-line code.
// - Use Markdown tables when comparing things.
// - Keep paragraphs reasonably short.
// - Do not return HTML.
// - Do not wrap your entire answer in a code block.
// - Do not return JSON unless the user explicitly asks for JSON.

// Focus on giving a useful, clear answer.
// `.trim();

    constructor() {
        const apiKey = process.env.LOGFARE_API_KEY;
        const proxy = process.env.HTTPS_PROXY;

        if (!apiKey) {
            throw new Error('LOGFARE_API_KEY is not configured');
          }
          
          if (proxy) {
            setGlobalDispatcher(new ProxyAgent(proxy));
          }

        this.client = new OpenAI({
            apiKey,
            baseURL: 'https://logfare.ai/v1',
            timeout: 60_000,
        });
    }

    async chat(message: string): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model: 'logfare/auto',

                messages: [
                    {
                        role: 'assistant',
                        content: message,
                    },
                ],
            });

            const content = response.choices[0]?.message?.content;

            if (!content) {
                throw new Error('AI returned an empty response');
            } 

            return content;
        } catch (error) {
            console.error('Logfare error:', error);

            throw new InternalServerErrorException(
                'Unable to generate AI response',
            );
        }
    }
}

