import { Router } from "https://deno.land/x/oak@v9.0.1/mod.ts";
import { authenticationHandler } from "../middleware.ts";

import mysqlClient from "../database.ts";
import EntryController from "../controller/EntryController.ts";

const entryController = new EntryController(mysqlClient);
const entryRouter = new Router({
  prefix: "/v1/entry",
});

entryRouter.use(authenticationHandler);

entryRouter.get(
  "/",
  entryController.getCollection.bind(entryController),
);

entryRouter.post(
  "/",
  entryController.addObject.bind(entryController),
);

entryRouter.put(
  "/:uuid",
  entryController.updateObject.bind(entryController),
);

entryRouter.delete(
  "/:uuid",
  entryController.removeObject.bind(entryController),
);

export default entryRouter;
