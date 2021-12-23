import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { authenticationHandler } from "../middleware.ts";

import PlayerController from "../controller/PlayerController.ts";
import mysqlClient from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/connections/mysql.ts";

const playerRouter = new Router({ prefix: "/v1/player" });
const playerController = new PlayerController(
  mysqlClient,
  "player",
);
import manager from "../manager.ts";

const get = playerController.getCollection.bind(playerController);
const post = playerController.addObject.bind(playerController);
const remove = playerController.removeObject.bind(playerController);
const object = playerController.getObject.bind(playerController);

playerRouter.use(authenticationHandler);

playerRouter.get("/", get);
playerRouter.get("/:uuid", object);

playerRouter.post("/", post);
playerRouter.delete("/:uuid", remove);

playerRouter.get("/ws", async (ctx) => {
  if (!ctx.isUpgradable) {
    throw new Error("Connection is not upgradable!");
  }

  const socket = await ctx.upgrade();
  manager.addClient(socket);
});

export default playerRouter;
