import BaseCollection from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/collection/BaseCollection.ts";
import PlayerEntity from "../entity/PlayerEntity.ts";

export default class PlayerCollection extends BaseCollection {
  public players: PlayerEntity[] = [];
}
