import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import 'dotenv/config';
import OpenAI from 'openai';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

@Injectable()
export class AiService {
    private readonly client: OpenAI;

    constructor() {
        const apiKey = process.env.LOGFARE_API_KEY;
        const proxy = process.env?.HTTPS_PROXY;

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