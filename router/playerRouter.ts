import { Router } from "https://deno.land/x/oak@v9.0.1/mod.ts";
import { authenticationHandler } from "../middleware.ts";

import mysqlClient from "../database.ts";
import PlayerController from "../controller/PlayerController.ts";

const playerController = new PlayerController(mysqlClient);
const playerRouter = new Router({
  prefix: "/v1/player",
});

playerRouter.use(authenticationHandler);

playerRouter.get(
  "/",
  playerController.getCollection.bind(playerController),
);

playerRouter.post(
  "/",
  playerController.addObject.bind(playerController),
);

playerRouter.put(
  "/:uuid",
  playerController.updateObject.bind(playerController),
);

playerRouter.delete(
  "/:uuid",
  playerController.removeObject.bind(playerController),
);

export default playerRouter;
