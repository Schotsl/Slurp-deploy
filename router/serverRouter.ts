import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";

import ServerController from "../controller/ServerController.ts";
import mysqlClient from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/connections/mysql.ts";

const serverRouter = new Router({ prefix: "/v1/server" });
const serverController = new ServerController(
  mysqlClient,
  "server",
);

const get = serverController.getCollection.bind(serverController);
const post = serverController.addObject.bind(serverController);

serverRouter.get("/", get);
serverRouter.post("/", post);

export default serverRouter;
