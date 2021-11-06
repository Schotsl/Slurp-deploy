import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { Application } from "https://deno.land/x/oak@v9.0.1/mod.ts";
import {
  errorHandler,
  limitHandler,
  postHandler,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/middleware.ts";

import entryRouter from "./router/playerRouter.ts";
import serverRouter from "./router/playerRouter.ts";
import playerRouter from "./router/playerRouter.ts";

const application = new Application();

application.use(oakCors());

application.use(postHandler);
application.use(errorHandler);
application.use(limitHandler);

application.use(entryRouter.routes());
application.use(serverRouter.routes());
application.use(playerRouter.routes());

application.use(entryRouter.allowedMethods());
application.use(serverRouter.allowedMethods());
application.use(playerRouter.allowedMethods());

application.listen({ port: 8080 });
