import { Router } from "https://deno.land/x/oak@v9.0.1/mod.ts";
import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { testMysql } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/testing.ts";
import { configLogger } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { initializeEnv } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";
import { authenticationHandler } from "./middleware.ts";

import EntryController from "./controller/EntryController.ts";
import ServerController from "./controller/ServerController.ts";
import PlayerController from "./controller/PlayerController.ts";

// Initialize .env variables and make sure they are set
initializeEnv([
  "SLURP_SERVER_MYSQL_PORT",
  "SLURP_SERVER_MYSQL_USERNAME",
  "SLURP_SERVER_MYSQL_PASSWORD",
  "SLURP_SERVER_MYSQL_HOSTNAME",
  "SLURP_SERVER_MYSQL_DATABASE",
]);

// Disable logging for MySQL
await configLogger({ enable: false });

const mysqlClient = new Client();

mysqlClient.connect({
  hostname: Deno.env.get("SLURP_SERVER_MYSQL_HOSTNAME")!,
  username: Deno.env.get("SLURP_SERVER_MYSQL_USERNAME")!,
  password: Deno.env.get("SLURP_SERVER_MYSQL_PASSWORD")!,
  port: +Deno.env.get("SLURP_SERVER_MYSQL_PORT")!,
  db: Deno.env.get("SLURP_SERVER_MYSQL_DATABASE")!,
});

await testMysql(mysqlClient);

const serverController = new ServerController(mysqlClient);
const playerController = new PlayerController(mysqlClient);
const entryController = new EntryController(mysqlClient);

const router = new Router();

router.get(
  "/v1/server",
  serverController.getCollection.bind(serverController),
);

router.post(
  "/v1/server",
  serverController.addObject.bind(serverController),
);

router.put(
  "/v1/server/:uuid",
  serverController.updateObject.bind(serverController),
);

router.delete(
  "/v1/server/:uuid",
  serverController.removeObject.bind(serverController),
);

router.get(
  "/v1/player",
  authenticationHandler,
  playerController.getCollection.bind(playerController),
);

router.post(
  "/v1/player",
  authenticationHandler,
  playerController.addObject.bind(playerController),
);

router.put(
  "/v1/player/:uuid",
  authenticationHandler,
  playerController.updateObject.bind(playerController),
);

router.delete(
  "/v1/player/:uuid",
  authenticationHandler,
  playerController.removeObject.bind(playerController),
);

router.get(
  "/v1/entry",
  authenticationHandler,
  entryController.getCollection.bind(entryController),
);

router.post(
  "/v1/entry",
  authenticationHandler,
  entryController.addObject.bind(entryController),
);

router.put(
  "/v1/entry/:uuid",
  authenticationHandler,
  entryController.updateObject.bind(entryController),
);

router.delete(
  "/v1/entry/:uuid",
  authenticationHandler,
  entryController.removeObject.bind(entryController),
);

export default router;
