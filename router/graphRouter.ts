import { Router } from "https://deno.land/x/oak@v9.0.1/mod.ts";

import mysqlClient from "../database.ts";
import GraphController from "../controller/GraphController.ts";

const graphController = new GraphController(mysqlClient);
const graphRouter = new Router({
  prefix: "/v1/graph",
});

graphRouter.get(
  "/",
  graphController.getCollection.bind(graphController),
);

graphRouter.post(
  "/",
  graphController.addObject.bind(graphController),
);

graphRouter.put(
  "/:uuid",
  graphController.updateObject.bind(graphController),
);

graphRouter.delete(
  "/:uuid",
  graphController.removeObject.bind(graphController),
);

export default graphRouter;
