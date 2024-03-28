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
      secret: 'mysercreadsfgaslhgeradsg!a098324.as!,ase',
      signOptions: { expiresIn: '7 days' },
    }),
  ],
})
export class AuthModule {}
