import { Router } from "https://deno.land/x/oak@v12.2.0/mod.ts";

import sessionManager from "../sessionManager.ts";

const socketRouter = new Router({ prefix: "/v1/socket" });

socketRouter.get("/session/:uuid", async (ctx) => {
  const socket = await ctx.upgrade();
  const session = ctx.params.uuid;

  sessionManager.addListener(session, socket, "session");
});

socketRouter.get("/graph/:uuid", async (ctx) => {
  const socket = await ctx.upgrade();
  const session = ctx.params.uuid;

  sessionManager.addListener(session, socket, "graph");
});

socketRouter.get("/bars/:uuid", async (ctx) => {
  const socket = await ctx.upgrade();
  const session = ctx.params.uuid;

  sessionManager.addListener(session, socket, "bars");
});

export default socketRouter;
