import { Injectable } from '@nestjs/common';
import { K8sService } from 'src/k8s/k8s.service';
import { VaultService } from 'src/vault/vault.service';
import axios from 'axios';

export type SignRequest = {
  signerPubKey: string;
  transaction: any;
};

export type AddKey = {
  publicKey: string;
};

@Injectable()
export class Web3SignerService {
  private web3SignerUrl: string;

  constructor(
    private k8sService: K8sService,
    private vaultService: VaultService,
  ) {
    this.web3SignerUrl = process.env.WEB3_SIGNER_URL || '';
  }

  async updateConfigMap(
    namespace: string,
    configMapName: string,
    fileName: string,
    fileContent: string,
  ): Promise<void> {
    return this.k8sService.updateConfigMap(
      namespace,
      configMapName,
      fileName,
      fileContent,
    );
  }

  async addKeyToWeb3Signer(publicKey: string): Promise<void> {
    const namespace = 'default';
    const configMapName = 'my-configmap';
    const fileName = 'config.yaml';
    const fileContent =
      `type: "hashicorp"\n` +
      `keyType: "SECP256K1"\n` +
      `tlsEnabled: "false"\n` +
      `keyPath: "/v1/secret/data/${publicKey}"\n` +
      `keyName: "key"\n` +
      `serverHost: "vault"\n` +
      `serverPort: "8200"\n` +
      `timeout: "10000"\n` +
      `token: "${this.vaultService.vaultToken}"\n`;
    await this.updateConfigMap(namespace, configMapName, fileName, fileContent);
    return;
  }

  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async signTransaction(
    signerPubKey: string,
    transaction: any,
  ): Promise<string> {
    await this.addKeyToWeb3Signer(signerPubKey);

    await this.sleep(5000);

    await axios.post(`${this.web3SignerUrl}/reload`, {});

    await this.sleep(1000);

    const response = await axios.post(this.web3SignerUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_signTransaction',
      params: [transaction],
    });
    return response.data.result;
  }
}
