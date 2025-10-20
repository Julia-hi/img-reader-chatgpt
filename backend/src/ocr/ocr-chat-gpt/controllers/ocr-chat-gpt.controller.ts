import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { OcrChatGptService } from '../services/ocr-chat-gpt.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('ocr')
export class OcrChatGptController {
  constructor(private readonly ocrChatGptService: OcrChatGptService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const result = await this.ocrChatGptService.processImage(file.buffer);
      return result; // JSON с нужными полям
    } catch (err) {
      console.error('OCR Error:', err); // <-- выводим ошибку в консоль сервера
      throw err;
    }
  }
}
