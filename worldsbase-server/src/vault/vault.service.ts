import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Vault from 'hashi-vault-js';

@Injectable()
export class VaultService {
  private vault: Vault;
  private vaultToken: string;

  constructor() {
    this.vault = new Vault({
      https: true,
      baseUrl: 'http://127.0.0.1:8200/v1',
      rootPath: 'secret',
      timeout: 2000,
      proxy: false,
    });

    this.vaultToken = process.env.VAULT_TOKEN || '';
  }

  async createVaultSececret(secret: any): Promise<any> {
    const response = await this.vault.createKVSecret(
      this.vaultToken,
      secret.name,
      secret.data,
    );
    if (response.isVaultError) {
      throw new HttpException(
        response.vaultHelpMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      return response;
    }
  }
}
