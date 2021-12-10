import { Router } from "https://deno.land/x/oak@v10.0.0/mod.ts";
import { authenticationHandler } from "../middleware.ts";

import mysqlClient from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/connections/mysql.ts";
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
