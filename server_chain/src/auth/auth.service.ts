import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getMe(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('getMe');
    });
  }

  login(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('login');
    });
  }

  signup(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('signup');
    });
  }
}
