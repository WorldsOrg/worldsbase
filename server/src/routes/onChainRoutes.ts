import { OnChainController } from "../controllers/onchain/onChainController";
import { Router } from "express";

const router = Router();

const controller = new OnChainController();

router.post("/mintNFT", controller.mintNFT);

export default router;
