import { Router } from "express";
import { AuthController } from "../controllers/auth/authControllers";

const router = Router();
const controller = new AuthController();

router.get("/me", controller.getMe);
router.post("/login", controller.login);
router.post("/signup", controller.signup);

export default router;
