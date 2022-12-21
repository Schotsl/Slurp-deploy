import PlayerController from "../controller/PlayerController.ts";

import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { authorizationHandler } from "../middleware.ts";

const playerController = new PlayerController("player");
const playerRouter = new Router({ prefix: `/v1/player` });

const playerCollection = playerController.getCollection.bind(playerController);
const playerRemove = playerController.removeObject.bind(playerController);
const playerObject = playerController.getObject.bind(playerController);
const playerPost = playerController.addObject.bind(playerController);
const playerPut = playerController.updateObject.bind(playerController);

playerRouter.get("/", authorizationHandler, playerCollection);
playerRouter.put("/:uuid", authorizationHandler, playerPut);
playerRouter.get("/entity/:uuid", authorizationHandler, playerObject);
playerRouter.delete("/:uuid", authorizationHandler, playerRemove);

playerRouter.post("/", playerPost);

export default playerRouter;
