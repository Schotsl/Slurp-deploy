import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { authorizationHandler } from "../middleware.ts";

import PlayerController from "../controller/PlayerController.ts";

const playerRouter = new Router({ prefix: "/v1/player" });
const playerController = new PlayerController("player");

const get = playerController.getCollection.bind(playerController);
const post = playerController.addObject.bind(playerController);
const remove = playerController.removeObject.bind(playerController);
const object = playerController.getObject.bind(playerController);

playerRouter.use(authorizationHandler);

playerRouter.get("/", get).use(authorizationHandler);
playerRouter.get("/:uuid", object).use(authorizationHandler);

playerRouter.post("/", post).use(authorizationHandler);
playerRouter.delete("/:uuid", remove).use(authorizationHandler);

export default playerRouter;
