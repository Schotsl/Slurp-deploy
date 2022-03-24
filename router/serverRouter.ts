import GeneralRouter from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/router/GeneralRouter.ts";
import ServerController from "../controller/ServerController.ts";

const serverController = new ServerController("server");
const serverRouter = new GeneralRouter(
  serverController,
  "server",
);

export default serverRouter.router;
