import { response_not_found, response_success } from "$utils/response.utils";
import { Request, Response, Router } from "express";
import routes from "./registry";

const mainRouter = Router();

mainRouter.get("/", (req: Request, res: Response) => {
  return response_success(res, "main routes!");
});

mainRouter.get("/ping", (req: Request, res: Response) => {
  return response_success(res, "pong!");
});

mainRouter.get("/robots.txt", (req: Request, res: Response) => {
  res.type("text/plain").send("User-agent: *\nAllow: /");
});

routes.forEach(({ path, handler }) => {
  if (path && handler) {
    mainRouter.use(path, handler);
  }
});

mainRouter.all("*", (req: Request, res: Response) => {
  return response_not_found(res);
});

export default mainRouter;
