import BaseCollection from "../../Uberdeno/collection/BaseCollection.ts";
import ServerEntity from "../entity/ServerEntity.ts";

export default class ServerCollection extends BaseCollection {
  public servers: ServerEntity[] = [];
}
