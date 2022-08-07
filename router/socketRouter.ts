import { Router } from "https://deno.land/x/oak@v10.6.0/mod.ts";

import managerPersonal from "../managerPersonal.ts";

const socketRouter = new Router({ prefix: "/v1/socket" });

socketRouter.get("/personal/:uuid", async (ctx) => {
  const uuid = ctx.params.uuid;
  const socket = await ctx.upgrade();

  managerPersonal.addListener(socket, uuid);
});

export default socketRouter;
