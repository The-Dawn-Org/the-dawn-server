import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service.js';

@Controller('')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('/ai-analysis')
  async chat(@Body() dto: string) {
    const text = await this.aiService.chat(
      "You are an AI analyst analyzing an interception event. Analyze the provided event data and give a concise, factual description of what happened, including the attacking body and drone, interception and event status, interceptor and launcher used, location and time, injuries or damage, and any relevant conclusions. Base your analysis only on the provided information, do not invent or assume missing details, and do not mention JSON or the data format. Answer in Hebrew using clear, natural language without Markdown symbols such as * or #."
      + JSON.stringify(dto)
      );
    console.log(JSON.stringify(dto))

    return {
      text,
    };
  }
}