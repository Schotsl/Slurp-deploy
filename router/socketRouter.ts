import { Router } from "https://deno.land/x/oak@v10.6.0/mod.ts";

import manager from "../manager.ts";

const socketRouter = new Router({ prefix: "/v1/socket" });

socketRouter.get("/", async (ctx) => {
  if (!ctx.isUpgradable) {
    throw new Error("Connection is not upgradable!");
  }

  const socket = await ctx.upgrade();

  manager.authenticateClient(socket);
});

export default socketRouter;
