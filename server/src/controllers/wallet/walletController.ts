import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { TurnkeyClient, createActivityPoller } from "@turnkey/http";
import { ApiKeyStamper } from "@turnkey/api-key-stamper";

const TURNKEY_BASE_URL = "https://api.turnkey.com";

export type GetWalletRequest = {
  organizationId: string;
};
export type TFormattedWalletAccount = {
  address: string;
  path: string;
};

export type TFormattedWallet = {
  id: string;
  name: string;
  accounts: TFormattedWalletAccount[];
};

export type CreateSubOrgResponse = {
  subOrgId: string;
  wallet: TFormattedWallet;
};

export class WalletController {
  initTurnkeyClient = async () =>
    new TurnkeyClient(
      { baseUrl: TURNKEY_BASE_URL },
      new ApiKeyStamper({
        apiPublicKey: process.env.apiPublicKey as string,
        apiPrivateKey: process.env.apiPrivateKey as string,
        // eslint-disable-next-line comma-dangle
      })
    );

  createWallet = async (req: Request, res: Response) => {
    const { user_id } = req.body;
    if (!user_id) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid input");
      return;
    }
    try {
      const turnkeyClient = await this.initTurnkeyClient();
      const activityPoller = createActivityPoller({
        client: turnkeyClient,
        requestFn: turnkeyClient.createPrivateKeys,
      });

      const pk = await activityPoller({
        type: "ACTIVITY_TYPE_CREATE_PRIVATE_KEYS_V2",
        timestampMs: String(Date.now()),
        organizationId: "cfc11de9-5062-4834-aaea-f8ff5ea327b8",
        parameters: {
          privateKeys: [
            {
              privateKeyName: user_id,
              curve: "CURVE_SECP256K1",
              addressFormats: ["ADDRESS_FORMAT_ETHEREUM"],
              privateKeyTags: [],
            },
          ],
        },
      });

      const walletAddress = pk.result.createPrivateKeysResultV2?.privateKeys?.[0];

      // const result = await turnkeyClient.createWallet({
      //   type: "ACTIVITY_TYPE_CREATE_WALLET",
      //   organizationId: "cfc11de9-5062-4834-aaea-f8ff5ea327b8",
      //   timestampMs: String(Date.now()),
      //   parameters: {
      //     walletName: user_id,
      //     accounts: [
      //       {
      //         curve: "CURVE_SECP256K1",
      //         pathFormat: "PATH_FORMAT_BIP32",
      //         path: "m/44'/60'/0'/0/0",
      //         addressFormat: "ADDRESS_FORMAT_ETHEREUM",
      //       },
      //     ],
      //   },
      // });
      // const walletAddress = result.activity.result.createWalletResult?.addresses[0];

      if (!walletAddress) {
        res.status(StatusCodes.BAD_REQUEST).send("Error creating wallet");
        return;
      }
      res.status(StatusCodes.OK).json(walletAddress.addresses?.[0]?.address);
    } catch (error) {
      console.error("Error creating wallet:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Error creating wallet");
    }
  };
}
