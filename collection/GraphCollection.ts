import BaseCollection from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/collection/BaseCollection.ts";
import GraphEntity from "../entity/GraphEntity.ts";

export default class PlayerCollection extends BaseCollection {
  public players: GraphEntity[] = [];
}
