import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { Application } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import {
  errorHandler,
  limitHandler,
  postHandler,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/middleware.ts";

import entryRouter from "./router/entryRouter.ts";
import playerRouter from "./router/playerRouter.ts";
import sessionRouter from "./router/sessionRouter.ts";
import socketRouter from "./router/socketRouter.ts";

const application = new Application();

application.use(oakCors());

application.use(errorHandler);
application.use(limitHandler);
application.use(postHandler);

application.use(entryRouter.routes());
application.use(sessionRouter.routes());
application.use(playerRouter.routes());
application.use(socketRouter.routes());

application.use(entryRouter.allowedMethods());
application.use(sessionRouter.allowedMethods());
application.use(playerRouter.allowedMethods());
application.use(socketRouter.allowedMethods());

application.listen({ port: 8080 });

// Attempting redeploy
