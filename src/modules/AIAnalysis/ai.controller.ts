import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { ChatDto } from './dto/chat.dto.js';

@Controller('')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('/ai-analysis')
  async chat(@Body() dto: ChatDto) {
    const text: string = await this.aiService.chat(
      "Here is a json object of interception event. Please analyze it and give me the realizations. " +
      "DONT MENTION THAT THE INFORMATION IS IN JSON. Enter the answer in hebrew, without * signs and # signs" +
      JSON.stringify(dto)
      );
    console.log(JSON.stringify(dto))

    return {
      text,
    };
  }
}