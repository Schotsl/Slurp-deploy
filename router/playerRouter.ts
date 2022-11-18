import GeneralRouter from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.2/router/GeneralRouter.ts";
import PlayerController from "../controller/PlayerController.ts";

const playerController = new PlayerController("player");
const playerRouter = new GeneralRouter(
  playerController,
  "player",
);

export default playerRouter.router;
