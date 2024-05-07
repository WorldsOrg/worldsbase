import { Body, Controller, Post } from '@nestjs/common';
import { MintERC20Dto, ThirdwebService } from './thirdweb.service';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('Thirdweb')
@Controller('thirdweb')
export class ThirdwebController {
  constructor(private readonly thirdwebService: ThirdwebService) {}

  @Post('/mint_erc20_vault')
  @ApiOperation({ summary: 'Mints erc20 token(s) to a wallet' })
  @ApiResponse({
    status: 200,
    description: 'Token(s) minted',
    type: String,
  })
  createWallet(@Body() mintERC20: MintERC20Dto): Promise<string> {
    return this.thirdwebService.mintERC20Vault(
      mintERC20.minter,
      mintERC20.chainId,
      mintERC20.contractAddress,
      mintERC20.to,
      mintERC20.amount,
    );
  }
}
