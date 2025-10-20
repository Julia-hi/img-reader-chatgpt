import { Test, TestingModule } from '@nestjs/testing';
import { OcrChatGptService } from './ocr-chat-gpt.service';

describe('OcrChatGptService', () => {
  let service: OcrChatGptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OcrChatGptService],
    }).compile();

    service = module.get<OcrChatGptService>(OcrChatGptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
