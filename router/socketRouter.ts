import { Router } from "https://deno.land/x/oak@v10.6.0/mod.ts";

import manager from "../manager.ts";

const socketRouter = new Router({ prefix: "/v1/socket" });

socketRouter.get("/:uuid", async (ctx) => {
  const uuid = ctx.params.uuid;
  if (!ctx.isUpgradable) {
    throw new Error("Connection is not upgradable!");
  }

  const socket = await ctx.upgrade();

  manager.addPersonal(socket, uuid);
});

export default socketRouter;
