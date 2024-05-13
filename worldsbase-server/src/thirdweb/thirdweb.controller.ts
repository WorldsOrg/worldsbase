import { Body, Controller, Post } from '@nestjs/common';
import {
  BurnERC20Dto,
  MintERC20Dto,
  ThirdwebService,
} from './thirdweb.service';
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
  mintErc20Vault(@Body() mintERC20: MintERC20Dto): Promise<string> {
    return this.thirdwebService.mintERC20Vault(
      mintERC20.minter,
      mintERC20.chainIdOrRpc,
      mintERC20.contractAddress,
      mintERC20.to,
      mintERC20.amount,
    );
  }

  @Post('/burn_erc20_vault')
  @ApiOperation({ summary: 'Burns erc20 token(s) from a wallet' })
  @ApiResponse({
    status: 200,
    description: 'Token(s) burned',
    type: String,
  })
  burnErc20Vault(@Body() burnErc20: BurnERC20Dto): Promise<string> {
    return this.thirdwebService.burnERC20Vault(
      burnErc20.tokenOwner,
      burnErc20.chainIdOrRpc,
      burnErc20.contractAddress,
      burnErc20.amount,
    );
  }
}
