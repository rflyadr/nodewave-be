import { Router } from "express";
import multer from "multer";
import { authenticateJWT } from "../middlewares/jwtMiddleware";
import * as FileController from "../controllers/rest/FileController";

const upload = multer({ dest: "uploads/" });

const router = Router();

router.post(
  "/upload",
  authenticateJWT,
  upload.single("file"),
  FileController.uploadFile
);

router.get(
  "/",
  authenticateJWT,
  FileController.listFiles
);

router.get(
  "/:id/content",
  authenticateJWT,
  FileController.getFileContent
);

router.delete(
  "/:id",
  authenticateJWT,
  FileController.deleteFile
);

export default router;
