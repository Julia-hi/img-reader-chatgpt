/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import sharp from 'sharp';
import * as Tesseract from 'tesseract.js';
const { PDFParse } = require('pdf-parse');

import { fileTypeFromBuffer, FileTypeResult } from 'file-type';

@Injectable()
export class OcrChatGptService {
  async processImage(fileBuffer: Buffer) {
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY);

    // 1️⃣ Предобработка изображения
    const preprocessed = await sharp(fileBuffer)
      .rotate()
      .resize({ width: 1500 })
      .grayscale()
      .normalize()
      .toBuffer();

    // 2️⃣ OCR через Tesseract
    const {
      data: { text },
    } = await Tesseract.recognize(preprocessed, 'eng+rus', {
      logger: (m) => console.log(m),
    });

    // 3️⃣ Формируем prompt для ChatGPT
    const prompt = `
Ты эксперт по извлечению данных из документов.
Вот текст документа:
${text}

Извлеки следующие поля и выведи строго в JSON:
{
  "días cotizados": "",
  "Base reguladora diaria": "",
  "peroido": ""
}
Если поля отсутствуют, ставь null.
`;

    //  Request to ChatGPT
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты эксперт по извлечению информации из документов.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // 5️⃣ Парсим JSON от ChatGPT
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const gptText = response.data.choices[0].message.content;
    let parsed = {};
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      parsed = JSON.parse(gptText);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      console.error('Ошибка парсинга JSON от ChatGPT:', gptText);
    }

    return parsed;
  }


  /**
   * sort files received from frontend and send them to corresponded reader
   * @param fileBuffer 
   * @returns 
   */
  async extractMultipleFiles(fileBuffer: Buffer[]): Promise<any> {
    let fullText = '';
    for (const buffer of fileBuffer) {
      const fileType: FileTypeResult | undefined = await fileTypeFromBuffer(buffer);
      if (fileType?.mime === 'application/pdf') {
        // PFD case
        const text = await this.readPDF(buffer);
        fullText += text + '\n';

      } else if (fileType?.mime?.startsWith('image/')) {
        //image case
        const text = await this.readImage(buffer);
        fullText += text + '\n';
      }

    }


   // Descomentar esto para enviar peticiones a chatGPT !!!!!!
   /*  const responseChat = await this.chatGPTService.extractByChatGPT(fullText);
    let result: any;

    if (typeof responseChat === 'string') {
      try {
        result = JSON.parse(responseChat);
      } catch (e) {
        console.error('Error parseando JSON:', e);
        result = {};
      }
    } else {
      result = responseChat; // ya es objeto
    } */

    // Devuelve la estructura correcta
    return {
      data: {
       // results: result // <- aquí va directamente tu objeto <---- !!!!!!!! Descomentar esto para enviar peticiones a chatGPT !!!!!!
       result: fullText
      },
      message: 'Success'
    };

  }

  /**
   * read text of pdf file
   * return text as string
   * @param fileBuffer 
   * @returns 
   */
  async readPDF(fileBuffer: Buffer): Promise<string> {
    try {
      const uint8Array = new Uint8Array(fileBuffer);
      // PDFParse now accepts Uint8Array
      const parser = await new PDFParse(uint8Array);
      const result = await parser.getText();
      //if text detected
      if (result.pages[0].text.length > 0) {
        await parser.destroy();
        return result.text;
      } else {
        // If there is no text, it is a scanned PDF → convert pages to images and apply OCR
        console.log('⚠️ PDF escaneado detectado, aplicando OCR...');
        const scanned = await parser.getScreenshot({ scale: 1.5 });
        const ocrText = await this.extractTextFromScannedPDF(scanned);
        await parser.destroy();
        return ocrText;

      }
    } catch (err) {
      console.error('❌ Error leyendo PDF:', err);
      return '';
    }
  }

    /**
  * extract image from pdf scanned
  * @param pages 
  * @returns 
  */
  async extractTextFromScannedPDF(pages: any): Promise<string> {
    try {
      const texts = await Promise.all(
        pages.pages.map(async (page: any, index: any) => {
          try {
            const pdfBytes = await this.renderPageToPNG(page.dataUrl);
            const text = await this.readImage(pdfBytes);
            return text;
          } catch (err) {
            console.error(`Error en página ${index + 1}:`, err);
            return ''; // Continuar con el resto de páginas
          }
        })
      );
      return texts.join('\n\n');
    } catch (err) {
      console.error('Error extrayendo texto del PDF:', err);
      return '';
    }
  }

   /**
   * extract text from image
   * @param imageBuffer 
   * @returns 
   */
  async readImage(imageBuffer: Buffer): Promise<string> {
    // Image preprocessing
    const preprocessed = await sharp(imageBuffer)
      .rotate()
      .resize({ width: 2000 })
      .grayscale()
      .threshold(160)
      .sharpen()
      .toBuffer();

    // OCR with Tesseract using config
    const { data: { text } } = await (Tesseract as any).recognize(
      preprocessed,
      'eng+spa+cat',
      {
        logger: (m: any) => console.log(m),
        config: 'tessedit_pageseg_mode=6',
    });

    const fixedText = text
      .replace(/\|/g, '/')
      .replace(/\//g, '/')
      .replace(/％/g, '%');

    console.log('📄 Resultado final:', fixedText.trim());
    return fixedText.trim();
  }

  /**
  * Renderiza una página de PDF a PNG usando sharp.
  * @param page Página de PDF (pdf-lib)
  * @returns Buffer PNG
  */
  async renderPageToPNG(dataUrl: string): Promise<Buffer> {
    const base64Data = dataUrl.replace(/^data:.*;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Convertir (por si acaso) a PNG usando sharp
    const pngBuffer = await sharp(imageBuffer, { density: 300 })
      .png()
      .toBuffer();

    return pngBuffer;
  }

}
