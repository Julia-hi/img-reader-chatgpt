import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OcrChatGptService {

  /**
   * search data from text by ChatGPT API
   * returnt cups, rates (p1, p2 , p3) and contracted power in json format
   * @param text 
   * @returns json
   */
  async extractByChatGPT(text:string) {
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY);

    // prompt for ChatGPT
    const prompt = `Eres un experto de extraer datos del texto. Necesito CUPS(Código Universal de Punto de Suministro),
    valor de Potencia contratada y tarifas de potencia contratada de p1,p2, y p3 como valores del precio por 1 kilovatio-hora. 
    
    Es el texto:
    ${text}
    Los resultados deben ser en foemato json:
    {
      "CUPS": "ES0031405475679008HQ0F",
      "PotenciaContratada": ""
    },
    "TarifasPorKWh": {
      "P1_Punta": "",
      "P2_Plana": "",
      "P3_Vall": ""
    }
    
    Si en valores numericos aparecen puntos - sustitulla los pum¡nros por una coma.
    Los valores numericos sin lettras.
    Si algún dato no aparece - asigna como null.
    `;

    // requiest to ChatGPT
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

    // 5️⃣ Parsing JSON from ChatGPT
    const gptText = response.data.choices[0].message.content;
    let parsed = {};
    try {
      parsed = JSON.parse(gptText);
    } catch (e) {
      console.error('ChatGPT JSON parsing error:', gptText);
    }
    return parsed;
  }
}
