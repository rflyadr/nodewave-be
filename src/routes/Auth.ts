import { Router } from "express";
import { login, register } from "../controllers/rest/AuthController";
import { validateRegister } from "../validations/userValidation";

const router = Router();

router.post("/login", login);
router.post("/register", validateRegister, register);

export default router;
