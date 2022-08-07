import GeneralRouter from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/router/GeneralRouter.ts";
import EntryController from "../controller/EntryController.ts";

const entryController = new EntryController("entry");
const entryRouter = new GeneralRouter(
  entryController,
  "entry",
);

export default entryRouter.router;
