import { XApiKeyGuard } from './x-api-key.guard';

describe('XApiKeyGuard', () => {
  it('should be defined', () => {
    expect(new XApiKeyGuard()).toBeDefined();
  });
});
