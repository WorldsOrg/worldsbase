import axios from "axios";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export class OnChainController {
  mintNFT = async (req: Request, res: Response) => {
    const { wallet_address } = req.body;
    if (!wallet_address) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid input");
      return;
    }
    try {
      const result = await axios.post(
        "https://api.syndicate.io/transact/sendTransaction",
        {
          projectId: "5a904ed8-5fbd-459c-b640-e01f7aa9cf5c",
          contractAddress: "0xbEc332E1eb3EE582B36F979BF803F98591BB9E24",
          chainId: 80001,
          functionSignature: "mint(address account)",
          args: { account: wallet_address },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.SYNDICATE_API_KEY}`,
          },
        },
      );

      if (!result.data.transactionId) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Error minting to wallet");
        return;
      }

      res.status(StatusCodes.OK).json(result.data.transactionId);
    } catch (error) {
      console.error("Error minting to wallet:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Error minting to wallet");
    }
  };
}
