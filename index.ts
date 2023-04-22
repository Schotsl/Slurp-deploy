import Server from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/other/Server.ts";

import entryRouter from "./router/entryRouter.ts";
import playerRouter from "./router/playerRouter.ts";
import socketRouter from "./router/socketRouter.ts";
import sessionRouter from "./router/sessionRouter.ts";

import { authorizationHandler } from "./middleware.ts";

const server = new Server();

// We'll import the playerRouter and sessionRouter first since POST doesn't require authorization
server.use(playerRouter.routes());
server.use(sessionRouter.routes());
server.use(socketRouter.routes());

server.use(authorizationHandler);

server.use(entryRouter.routes());

server.listen(8080);
