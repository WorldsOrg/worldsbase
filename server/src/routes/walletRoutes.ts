import { WalletController } from "../controllers/wallet/walletController";
import { Router } from "express";

const router = Router();

const controller = new WalletController();

router.post("/createWallet", controller.createWallet);

export default router;
