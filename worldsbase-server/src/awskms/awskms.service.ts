import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  KMSClient,
  GetPublicKeyCommand,
  CreateKeyCommand,
} from '@aws-sdk/client-kms';
import * as asn1js from 'asn1js';
import { keccak256 } from 'ethers/lib/utils';

@Injectable()
export class AwsKmsService {
  private kms: KMSClient;
  private AWS_ACCESS_KEY_ID: string = process.env.AWS_ACCESS_KEY_ID || '';
  private AWS_SECRET_KEY: string = process.env.AWS_SECRET_KEY || '';

  constructor() {
    this.kms = new KMSClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.AWS_SECRET_KEY,
      },
    });
  }

  async createKey(): Promise<string> {
    const response = await this.kms.send(
      new CreateKeyCommand({
        KeySpec: 'ECC_SECG_P256K1',
        KeyUsage: 'SIGN_VERIFY',
      }),
    );
    if (!response.KeyMetadata?.KeyId) {
      throw new HttpException(
        'Error creating aws kms key',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const key_id = response.KeyMetadata?.KeyId;
    return key_id;
  }

  /**
   *
   * @returns a DER-encoded object as defined by ANS X9.62–2005.
   */
  async getDerPublickey(KeyId: string): Promise<Buffer> {
    const key = await this.kms.send(
      new GetPublicKeyCommand({
        KeyId: KeyId,
      }),
    );
    if (!key.PublicKey) {
      throw new Error('AWSKMS: PublicKey is undefined.');
    }
    return Buffer.from(key.PublicKey);
  }

  decryptPublickeyDerEncoding(input: Buffer): Buffer {
    /**
     * Before calculating the Ethereum address, we need to get the raw value of the public key.
     * the input returns a DER-encoded X.509 public key
     * asSubjectPublickeyInfo (SPKI), as defined in RFC 5280.
     * Use an ASN1 library that allows us to define this as a schema as `OBJECT IDENTIFIER `
     * https://www.rfc-editor.org/rfc/rfc5480#section-2
     */
    const schema = new asn1js.Sequence({
      value: [
        new asn1js.Sequence({ value: [new asn1js.ObjectIdentifier()] }),
        new asn1js.BitString({ name: 'objectIdentifier' }),
      ],
    });
    const parsed = asn1js.verifySchema(input, schema);
    if (!parsed.verified) {
      throw new Error(`Publickey: failed to parse. ${parsed.result.error}`);
    }
    const objectIdentifier = parsed.result.objectIdentifier.valueBlock.valueHex;

    /**
     * According to section 2.2 of RFC 5480, the first byte, 0x04 indicates that this is an uncompressed key.
     * We need to remove this byte for the public key to be correct. Once we delete the first byte, we get the
     * raw public key that can be used to calculate our Ethereum address.
     */
    const publickey = objectIdentifier.slice(1); // remove 0x04

    /**
     * Returns the wallet's public key buffer
     */
    return Buffer.from(publickey);
  }

  publickeyToAddress(input: Buffer) {
    const hash = keccak256(input).slice(-40);
    const address = '0x' + hash;
    return address;
  }

  async getPublicKey(KeyId: string) {
    const derPublickey = await this.getDerPublickey(KeyId);
    const publickey = this.decryptPublickeyDerEncoding(derPublickey);
    return this.publickeyToAddress(publickey);
  }
}
