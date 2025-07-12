import authRoutes from "./Auth";
import fileRoutes from "./File";
import productRoutes from "./Product";
import exampleRoutes from "./Example";
import userRoutes from "./User";

const routes = [
  { path: "/api/auth", handler: authRoutes },
  { path: "/api/files", handler: fileRoutes },
  { path: "/api/product", handler: productRoutes },
  { path: "/api/example", handler: exampleRoutes },
  { path: "/api/users", handler: userRoutes },
];

export default routes;
