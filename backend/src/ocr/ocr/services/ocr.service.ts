import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import * as path from 'path';


@Injectable()
export class OcrService {
  async extractText(imageBuffer: Buffer): Promise<string> {
    console.log("dentro del OcrService");

    // 1️⃣ Preprocesamiento de imagen
    const preprocessed = await sharp(imageBuffer)
      .rotate()
      .resize({ width: 2000 })
      .grayscale()
      .threshold(160)
      .sharpen()
      .toBuffer();

    // 2️⃣ Ruta local a modelos de idioma
    const langPath = path.join(__dirname, '../node_modules/@tesseract.js-data');

    // 3️⃣ OCR con Tesseract usando config
    const { data: { text } } = await (Tesseract as any).recognize(
      preprocessed,
      'eng+spa+cat',
      {
        langPath,
        logger: (m: any) => console.log(m),
        // config: 'tessedit_char_whitelist=0123456789./%, tessedit_pageseg_mode=6',
        config: 'tessedit_pageseg_mode=6',
      }
    );

    const fixedText = text
      .replace(/\|/g, '/')
      .replace(/\//g, '/')
      .replace(/％/g, '%');

    console.log('📄 Resultado final:', fixedText.trim());
    return fixedText.trim();
  }

  async extractMultipleImages(imageBuffers: Buffer[]): Promise<string> {
    const results = Promise.all(
      imageBuffers.map(buffer => this.extractText(buffer))
    );
    return (await results).join('\n\n');
  }
}
