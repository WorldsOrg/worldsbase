import { JwtService } from '@nestjs/jwt';
import { EOSAuthGuard } from './eos-auth.guard';

describe('EOSAuthGuard', () => {
  it('should be defined', () => {
    expect(new EOSAuthGuard(new JwtService())).toBeDefined();
  });
});
