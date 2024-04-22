import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Client } from '@litehex/node-vault';

export type VaultSecret = {
  name: string;
  data: {
    key: string;
  };
};

@Injectable()
export class VaultService {
  private vaultClient: Client;
  public vaultToken: string;
  public mountPath: string;

  constructor() {
    this.vaultClient = new Client({
      apiVersion: 'v1', // default
      endpoint: 'http://127.0.0.1:8200', // default
      token: process.env.VAULT_TOKEN || '', // Optional in case you want to initialize the vault
    });

    this.vaultToken = process.env.VAULT_TOKEN || '';
    this.mountPath = 'secret';
  }

  async createVaultSececret(secret: VaultSecret): Promise<any> {
    const mountPath = this.mountPath;
    const path = secret.name;
    try {
      const response = await this.vaultClient.kv2.write({
        mountPath,
        path,
        data: { key: secret.data.key },
      });
      return response;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
