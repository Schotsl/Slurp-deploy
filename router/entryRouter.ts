import GeneralRouter from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.2/router/GeneralRouter.ts";
import EntryController from "../controller/EntryController.ts";

const entryController = new EntryController("entry");
const entryRouter = new GeneralRouter(
  entryController,
  "entry",
);

export default entryRouter.router;
