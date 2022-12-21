import SessionController from "../controller/SessionController.ts";

import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { authorizationHandler } from "../middleware.ts";

const sessionController = new SessionController("session");
const sessionRouter = new Router({ prefix: `/v1/session` });

const sessionCollection = sessionController.getCollection.bind(
  sessionController,
);
const sessionRemove = sessionController.removeObject.bind(sessionController);
const sessionObject = sessionController.getObject.bind(sessionController);
const sessionPost = sessionController.addObject.bind(sessionController);
const sessionPut = sessionController.updateObject.bind(sessionController);

sessionRouter.get("/", authorizationHandler, sessionCollection);
sessionRouter.put("/:uuid", authorizationHandler, sessionPut);
sessionRouter.get("/entity/:uuid", authorizationHandler, sessionObject);
sessionRouter.delete("/:uuid", authorizationHandler, sessionRemove);

sessionRouter.post("/", sessionPost);

export default sessionRouter;
