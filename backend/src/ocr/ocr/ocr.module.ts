import { Module } from '@nestjs/common';
import { OcrChatGptController } from '../ocr-chat-gpt/controllers/ocr-chat-gpt.controller';
import { OcrChatGptService } from '../ocr-chat-gpt/services/ocr-chat-gpt.service';

@Module({
  controllers: [OcrChatGptController],
  providers: [OcrChatGptService],
})
export class OcrModule {}
