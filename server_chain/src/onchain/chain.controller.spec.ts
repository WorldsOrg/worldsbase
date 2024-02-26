import { Test, TestingModule } from '@nestjs/testing';
import { ChainController } from './chain.controller';
import { ChainService } from './chain.service';

describe('ChainController', () => {
  let chainController: ChainController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChainController],
      providers: [ChainService],
    }).compile();

    chainController = app.get<ChainController>(ChainController);
  });
});
