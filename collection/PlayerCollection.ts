import BaseCollection from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.0/main/collection/BaseCollection.ts";
import PlayerEntity from "../entity/PlayerEntity.ts";

export default class PlayerCollection extends BaseCollection {
  public players: PlayerEntity[] = [];
}
