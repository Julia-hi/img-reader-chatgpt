import { Injectable } from '@nestjs/common';
import axios from 'axios';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';

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

    // 4️⃣ Запрос к ChatGPT
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
}
