import { Router } from "express";
import { listProducts } from "../controllers/rest/ProductController";
const router = Router();

router.get("/", listProducts);

export default router;
