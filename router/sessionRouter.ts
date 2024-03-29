import SessionController from "../controller/SessionController.ts";

import { Router } from "https://deno.land/x/oak@v12.2.0/mod.ts";
import { authorizationHandler } from "../middleware.ts";

const sessionController = new SessionController("session");
const sessionRouter = new Router({ prefix: `/v1/session` });

const sessionCollection = sessionController.getCollection.bind(
  sessionController,
);

const sessionPut = sessionController.updateObject.bind(sessionController);
const sessionPost = sessionController.addObject.bind(sessionController);
const sessionRemove = sessionController.removeObject.bind(sessionController);
const sessionObject = sessionController.getObject.bind(sessionController);
const sessionShortcode = sessionController.getObjectByShortcode.bind(sessionController);


sessionRouter.get("/", authorizationHandler, sessionCollection);
sessionRouter.put("/:uuid", authorizationHandler, sessionPut);
sessionRouter.get("/entity/:uuid", authorizationHandler, sessionObject);
sessionRouter.delete("/:uuid", authorizationHandler, sessionRemove);

sessionRouter.get("/entity/shortcode/:shortcode", sessionShortcode);
sessionRouter.post("/", sessionPost);

export default sessionRouter;
