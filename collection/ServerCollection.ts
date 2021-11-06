import BaseCollection from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/collection/BaseCollection.ts";
import ServerEntity from "../entity/ServerEntity.ts";

export default class ServerCollection extends BaseCollection {
  public servers: ServerEntity[] = [];
}
