import { Body, Controller, Post } from '@nestjs/common';
import {
  BurnERC20Dto,
  MintERC20Dto,
  ThirdwebResponseDto,
} from './dto/thirdweb.dto';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThirdwebService, TxReceipt } from './thirdweb.service';

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
    type: ThirdwebResponseDto,
  })
  mintErc20Vault(@Body() mintERC20: MintERC20Dto): Promise<TxReceipt> {
    return this.thirdwebService.mintErc20Vault(
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
    type: ThirdwebResponseDto,
  })
  burnErc20Vault(@Body() burnErc20: BurnERC20Dto): Promise<TxReceipt> {
    return this.thirdwebService.burnERC20Vault(
      burnErc20.tokenOwner,
      burnErc20.chainIdOrRpc,
      burnErc20.contractAddress,
      burnErc20.amount,
    );
  }
}
