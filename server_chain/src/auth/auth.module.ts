import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TableService } from 'src/table/table.service';
import { DbModule } from 'src/db/db.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TableService],
  imports: [
    DbModule,
    JwtModule.register({
      global: true,
      secret: 'mysercreadsfgaslhgeradsg',
      signOptions: { expiresIn: '60s' },
    }),
  ],
})
export class AuthModule {}
