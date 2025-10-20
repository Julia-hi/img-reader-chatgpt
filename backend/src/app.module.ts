/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OcrModule } from './ocr/ocr/ocr.module';

@Module({
  imports: [OcrModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
