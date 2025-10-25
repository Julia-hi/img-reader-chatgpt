/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { OcrChatGptService } from '../services/ocr-chat-gpt.service';
import { AnyFilesInterceptor} from '@nestjs/platform-express';

@Controller('ocr')
export class OcrChatGptController {
  constructor(private readonly ocrChatGptService: OcrChatGptService) { }

  /*   @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file: Express.Multer.File) {
      try {
        const result = await this.ocrChatGptService.processImage(file.buffer);
        return result;
      } catch (err) {
        console.error('OCR Error:', err); 
        throw err;
      }
    } */

  /**
   * read multiple files
   * @param files
   * @returns
   */
  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    console.log('inside of upload');
    const buffers = files.map((f) => f.buffer);
    const results = await this.ocrChatGptService.extractMultipleFiles(buffers);
    return { results };
  }
}
