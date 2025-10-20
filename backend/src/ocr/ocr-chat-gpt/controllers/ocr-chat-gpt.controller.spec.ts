import { Test, TestingModule } from '@nestjs/testing';
import { OcrChatGptController } from './ocr-chat-gpt.controller';

describe('OcrChatGptController', () => {
  let controller: OcrChatGptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OcrChatGptController],
    }).compile();

    controller = module.get<OcrChatGptController>(OcrChatGptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
