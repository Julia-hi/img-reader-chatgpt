import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { OcrChatGptService } from '../services/ocr-chat-gpt.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { OcrService } from 'src/ocr/ocr/services/ocr.service';

@Controller('ocr')
export class OcrChatGptController {
  constructor(private readonly ocrChatGptService: OcrChatGptService, private readonly ocrService: OcrService) { }

  /*  @Post('upload')
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
   } */

  /**
   * read one image
   * @param file 
   * @returns 
   */
  /* @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File | any) {
    if (!file) {
      return { error: 'No file uploaded' };
    }

    const result = await this.ocrService.extractText(file.buffer);
    console.log(result)
    return { text: result };
  } */


  /**
   * read multiple images
   * @param files 
   * @returns 
   */
  @Post('upload')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const buffers = files.map(f => f.buffer);
    const results = await this.ocrService.extractMultipleImages(buffers);
    return { results };
  }

}
