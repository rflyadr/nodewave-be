import server from "$server/instance";
import Logger from '$pkg/logger';
import mainRouter from "../routes";
import { response_not_found, response_internal_server_error } from "$utils/response.utils";

const startRestApp = () => {
  Logger.info("Starting App : rest");
  const app = server.restServer();

  app.use(mainRouter);

  app.use((req, res) => {
    return response_not_found(res, "Endpoint not found");
  });

  app.use((err: any, req: any, res: any, next: any) => {
    return response_internal_server_error(res, err?.message || "Internal Server Error");
  });

  const PORT: number = Number(process.env.NODE_LOCAL_PORT) || 3010;
  return app.listen(PORT, () => {
    Logger.info(`Rest App is Running at Port ${PORT}`);
  });
};

export default startRestApp;
