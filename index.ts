import Server from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.1/other/Server.ts";

import entryRouter from "./router/entryRouter.ts";
import playerRouter from "./router/playerRouter.ts";
import sessionRouter from "./router/sessionRouter.ts";
import socketRouter from "./router/socketRouter.ts";

const server = new Server();

server.use(entryRouter.routes());
server.use(playerRouter.routes());
server.use(socketRouter.routes());
server.use(sessionRouter.routes());

server.listen(8080);
