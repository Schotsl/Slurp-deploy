import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import sessionManager from "../sessionManager.ts";

const socketRouter = new Router({ prefix: "/v1/socket" });

socketRouter.get("/session/:uuid", async (ctx) => {
  const socket = await ctx.upgrade();
  const session = ctx.params.uuid;

  sessionManager.addListener(session, socket);
});

export default socketRouter;
