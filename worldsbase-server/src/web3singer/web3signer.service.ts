import { Injectable } from '@nestjs/common';
import { K8sService } from 'src/k8s/k8s.service';
import { VaultService } from 'src/vault/vault.service';
import axios from 'axios';

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

  async setKeyFromVault(publicKey: string): Promise<void> {
    const namespace = 'default';
    const configMapName = 'my-configmap';
    const fileName = 'config.yaml';
    const fileContent = `type: "hashicorp"
    keyType: "SECP256K1"
    tlsEnabled: "false"
    keyPath: "/v1/secret/data/"${publicKey}
    keyName: "key"
    serverHost: "vault"
    serverPort: "8200"
    timeout: "10000"
    token: ${this.vaultService.vaultToken}
    `;
    await this.updateConfigMap(namespace, configMapName, fileName, fileContent);
    return;
  }

  async signTransaction(transaction: any): Promise<string> {
    const response = await axios.post(this.web3SignerUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_signTransaction',
      params: [transaction],
    });

    return response.data.result;
  }
}
