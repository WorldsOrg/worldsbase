import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Client } from '@litehex/node-vault';
import axios from 'axios';

export type VaultSecret = {
  name: string;
  data: {
    key: string;
  };
};

export type VaultReadError = {
  errors: string[];
};

export type VaultReadData = {
  data: {
    data: Record<string, string>;
    metadata: {
      version: number;
      created_time: string;
      custom_metadata: Record<string, string> | null;
      deletion_time: string;
      destroyed: boolean;
    };
  };
};

@Injectable()
export class VaultService {
  private vaultClient: Client;
  public vaultToken: string;
  public mountPath: string;
  private roleId: string;
  private secretId: string;
  private vaultAddress: string;

  constructor() {
    this.vaultToken = process.env.VAULT_TOKEN || '';
    this.mountPath = 'secret';
    this.roleId = process.env.VAULT_ROLE_ID || '';
    this.secretId = process.env.VAULT_SECRET_ID || '';
    this.vaultAddress = process.env.VAULT_ADDRESS || '';
    this.loginWithAppRole();
  }

  async loginWithAppRole(): Promise<void> {
    try {
      const VAULT_POST_DATA = `{"role_id": "${this.roleId}", "secret_id": "${this.secretId}"}`;
      const tokenResponse = await axios.post(
        `${this.vaultAddress}/v1/auth/approle/login`,
        VAULT_POST_DATA,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const token = tokenResponse.data.auth.client_token;
      this.vaultClient = new Client({
        apiVersion: 'v1',
        endpoint: this.vaultAddress,
        token,
      });
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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

  isVaultReadError(
    read: VaultReadError | VaultReadData,
  ): read is VaultReadError {
    return (read as VaultReadError).errors !== undefined;
  }

  async readVaultSecret(name: string): Promise<string> {
    const mountPath = this.mountPath;
    const path = name;
    try {
      const response = await this.vaultClient.kv2.read({
        mountPath,
        path,
      });
      if (this.isVaultReadError(response)) {
        throw new HttpException(
          response.errors,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return response.data.data.key;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
