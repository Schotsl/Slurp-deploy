import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { Application } from "https://deno.land/x/oak@v9.0.1/mod.ts";
import {
  errorHandler,
  limitHandler,
  postHandler,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/middleware.ts";

import router from "./router.ts";

const application = new Application();

application.use(postHandler);
application.use(errorHandler);
application.use(limitHandler);

application.use(oakCors());
application.use(router.routes());
application.use(router.allowedMethods());

application.listen({ port: 8080 });
