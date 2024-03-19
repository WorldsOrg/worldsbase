import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TableService } from 'src/table/table.service';
import { Me } from './entities/auth.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly tableService: TableService,
    private jwtService: JwtService,
  ) {}
  async verifyToken(token: string): Promise<Me> {
    if (token == null) throw new UnauthorizedException('Token is required');

    try {
      const decoded = await this.jwtService.verify(token);
      if (
        typeof decoded === 'object' &&
        'email' in decoded &&
        'id' in decoded
      ) {
        return decoded as Me;
      } else {
        throw new HttpException('Invalid token payload', HttpStatus.FORBIDDEN);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    try {
      const query = 'SELECT * FROM dashboard_users WHERE email = $1';
      const values = [email];
      const result = await this.tableService.executeQuery(query, values);

      if (result.data && result.data?.length > 0) {
        const user = result.data[0];

        if (await bcrypt.compare(password, user.password)) {
          const accessToken = await this.jwtService.signAsync({
            email: user.email,
            id: user.id,
          });
          return { token: accessToken };
        } else {
          throw new UnauthorizedException('Invalid credentials');
        }
      } else {
        throw new NotFoundException('No user found with this email');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async signup(email: string, password: string): Promise<{ token: string }> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query =
        'INSERT INTO dashboard_users (email, password) VALUES ($1, $2) RETURNING *;';
      const values = [email, hashedPassword];
      const result = await this.tableService.executeQuery(query, values);

      if (result.data && result.data.length > 0) {
        const user = result.data[0];
        const accessToken = await this.jwtService.signAsync({
          email: user.email,
          id: user.id,
        });
        return { token: accessToken };
      } else {
        throw new UnauthorizedException('User already exists');
      }
    } catch (err) {
      console.error(err);

      throw err;
    }
  }
}
