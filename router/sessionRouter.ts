import GeneralRouter from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.0/main/router/GeneralRouter.ts";
import SessionController from "../controller/SessionController.ts";

const sessionController = new SessionController("session");
const sessionRouter = new GeneralRouter(
  sessionController,
  "session",
);

export default sessionRouter.router;
