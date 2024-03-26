import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  KMSClient,
  GetPublicKeyCommand,
  CreateKeyCommand,
  SignCommand,
} from '@aws-sdk/client-kms';
import * as asn1js from 'asn1js';
import { keccak256, ethers } from 'ethersV6';
import BN from 'bn.js';
import * as ethutil from '@ethereumjs/util';

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

  /**
   *
   * @returns a DER-encoded object as defined by ANS X9.62–2005.
   */
  async signDigest(KeyId: string, digest: Buffer) {
    const response = await this.kms.send(
      new SignCommand({
        KeyId: KeyId,
        Message: digest,
        MessageType: 'DIGEST',
        SigningAlgorithm: 'ECDSA_SHA_256',
      }),
    );
    if (!response.Signature) {
      throw new Error('AWSKMS: Signature is undefined.');
    }
    return Buffer.from(response.Signature);
  }

  /**
   * According to EIP-2, allowing transactions with any s value (from 0 to the max number on the secp256k1n curve),
   * opens a transaction malleability concern. This is why a signature with a value of s > secp256k1n / 2 (greater than half of the curve) is invalid,
   * i.e. it is a valid ECDSA signature but from an Ethereum perspective the signature is on the dark side of the curve.
   * The code above solves this by checking if the value of s is greater than secp256k1n / 2 (line 38). If that’s the case,
   * we’re on the dark side of the curve. We need to invert s (line 41) in order to get a valid Ethereum signature.
   * This works because the value of s does not define a distinct point on the curve. The value can be +s or -s,
   * either signature is valid from an ECDSA perspective.
   */
  decodeRS(signature: Buffer): { r: Buffer; s: Buffer } {
    /**
     * According to section 2.2.3 of RFC 3279 this function expects to find two integers r and s
     * in the signature that will be returned as two BigNumber (BN.js) objects.
     */
    const schema = new asn1js.Sequence({
      value: [
        new asn1js.Integer({ name: 'r' }),
        new asn1js.Integer({ name: 's' }),
      ],
    });
    const parsed = asn1js.verifySchema(signature, schema);
    if (!parsed.verified) {
      throw new Error(
        `USignatureECDSA: failed to parse. ${parsed.result.error}`,
      );
    }

    /**
     * The result represents a point on the elliptic curve where r represents the x coordinate and s represents y.
     */
    const r = new BN(Buffer.from(parsed.result.r.valueBlock.valueHex));
    let s = new BN(Buffer.from(parsed.result.s.valueBlock.valueHex));

    /**
     * Because of EIP-2 not all elliptic curve signatures are accepted, the value of s needs to be SMALLER than half of the curve
     */
    const secp256k1N = new BN(
      'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141',
      16,
    ); // max value on the curve
    const secp256k1halfN = secp256k1N.div(new BN(2)); // half of the curve
    if (s.gt(secp256k1halfN)) {
      // if s is great than half of the curve, we need to invert it.
      // According to EIP2 https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2.md
      s = secp256k1N.sub(s);
    }
    return { r: r.toBuffer(), s: s.toBuffer() };
  }

  /**
   * candidate_1 = (chainId * 2 + 35) || 27
   * candidate_2 = (chainId * 2 + 36) || 28
   * v is the recovery id and it can be one of two possible values: `candidate_1` or `candidate_2`.
   * v is typically created during Ethereum’s signing process and stored alongside the signature. Unfortunately,
   * we did not use an Ethereum function to generate the signature which is why we do not know the value of v yet.
   *
   * Using Ethereum’s ecrecover(sig, v, r, s, chainId) function, we can recover the public key from an Ethereum signature.
   * Since we have the Ethereum account address, we already know what the outcome of this equation needs to be.
   * All we have to do is call this function twice, once with v = `candidate_1`, and in case that does not give us
   * the right address, a second time with v = `candidate_2`. One of the two calls should result in the Eth address.
   */
  calculateV(
    address: Buffer,
    digest: Buffer,
    r: Buffer,
    s: Buffer,
    chainId?: bigint,
  ): bigint {
    /**
     * This is the function to find the right v value
     * There are two matching signatues on the elliptic curve
     * we need to find the one that matches to our public key
     * it can be v = `candidate_1` or v = `candidate_2`
     */
    const candidate_1 = chainId ? chainId * BigInt(2) + BigInt(35) : BigInt(27);
    const candidate_2 = chainId ? chainId * BigInt(2) + BigInt(36) : BigInt(28);
    if (
      Buffer.compare(
        address,
        ethutil.publicToAddress(
          ethutil.ecrecover(digest, candidate_1, r, s, chainId),
        ),
      ) === 0
    ) {
      return candidate_1;
    } else if (
      Buffer.compare(
        address,
        ethutil.publicToAddress(
          ethutil.ecrecover(digest, candidate_2, r, s, chainId),
        ),
      ) === 0
    ) {
      return candidate_2;
    } else {
      return BigInt(-1);
    }
  }

  /**
   * @returns The tnx serialized ECDSA signature as a '0x'-prefixed string.
   */
  async signTransaction(
    address: string,
    KeyId: string,
    txData: any,
    chainId: any,
  ) {
    const ethersTx = ethers.Transaction.from(txData);
    const digest = Buffer.from(ethersTx.unsignedHash.substring(2), 'hex');

    const { r, s } = this.decodeRS(await this.signDigest(KeyId, digest));

    const addressBuffer = Buffer.from(address.replace('0x', ''), 'hex');
    const v = this.calculateV(addressBuffer, digest, r, s, BigInt(chainId));

    const signedTx = { ...txData, r, s, v };

    // Convert r and s to hexadecimal strings
    const rHex = signedTx.r.toString('hex');
    const sHex = signedTx.s.toString('hex');

    // Create the correctly formatted signed transaction object
    const formattedSignedTx = {
      ...signedTx,
      signature: {
        r: '0x' + rHex,
        s: '0x' + sHex,
        v: v,
      },
    };

    return ethers.Transaction.from(formattedSignedTx).serialized;
  }
}
