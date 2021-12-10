import { Router } from "https://deno.land/x/oak@v10.0.0/mod.ts";

import mysqlClient from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/connections/mysql.ts";
import ServerController from "../controller/ServerController.ts";

import { authenticationHandler } from "../middleware.ts";

const serverController = new ServerController(mysqlClient);
const serverRouter = new Router({
  prefix: "/v1/server",
});

serverRouter.get(
  "/",
  authenticationHandler,
  serverController.getCollection.bind(serverController),
);

serverRouter.post(
  "/",
  serverController.addObject.bind(serverController),
);

serverRouter.put(
  "/:uuid",
  authenticationHandler,
  serverController.updateObject.bind(serverController),
);

serverRouter.delete(
  "/:uuid",
  authenticationHandler,
  serverController.removeObject.bind(serverController),
);

export default serverRouter;
