import { Router } from "https://deno.land/x/oak@v11.0.0/mod.ts";

import manager from "../manager.ts";

const socketRouter = new Router({ prefix: "/v1/socket" });

socketRouter.get("/:uuid", async (ctx) => {
  const uuid = ctx.params.uuid;
  const socket = await ctx.upgrade();

  manager.addPersonal(socket, uuid);
});

export default socketRouter;
