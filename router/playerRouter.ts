import { Router } from "https://deno.land/x/oak@v10.0.0/mod.ts";
import { authenticationHandler } from "../middleware.ts";

import PlayerController from "../controller/PlayerController.ts";
import mysqlClient from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/connections/mysql.ts";

const playerRouter = new Router({ prefix: "/v1/player" });
const playerController = new PlayerController(
  mysqlClient,
  "player",
);

const get = playerController.getCollection.bind(playerController);
const post = playerController.addObject.bind(playerController);
const remove = playerController.removeObject.bind(playerController);

playerRouter.use(authenticationHandler);

playerRouter.get("/", get);
playerRouter.post("/", post);
playerRouter.delete("/:uuid", remove);

export default playerRouter;
