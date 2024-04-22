import { Body, Controller, Post } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddKey, SignRequest, Web3SignerService } from './web3signer.service';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('Web3Signer')
@Controller('web3signer')
export class Web3SignerController {
  constructor(private readonly web3SignerService: Web3SignerService) {}

  @Post('/signTransaction')
  @ApiOperation({ summary: 'Signs transaction using Web3Signer' })
  @ApiResponse({
    status: 200,
    description: 'Signed transaction',
    type: String,
  })
  async signTransaction(@Body() signRequest: SignRequest) {
    const signature = await this.web3SignerService.signTransaction(
      signRequest.signerPubKey,
      signRequest.transaction,
    );
    return { signature };
  }

  @Post('/addKeyToWeb3Signer')
  @ApiOperation({ summary: 'Adds key to Web3Signer' })
  @ApiResponse({
    status: 200,
    description: 'Key added to Web3Signer',
    type: String,
  })
  async addKeyToWeb3Signer(@Body() publicKey: AddKey) {
    await this.web3SignerService.addKeyToWeb3Signer(publicKey.publicKey);
    return;
  }
}
