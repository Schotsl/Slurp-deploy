import { Router } from "https://deno.land/x/oak@v10.0.0/mod.ts";

import ServerController from "../controller/ServerController.ts";
import mysqlClient from "../../Uberdeno/connections/mysql.ts";

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
