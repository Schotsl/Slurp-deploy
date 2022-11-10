import BaseEntity from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.0/entity/BaseEntity.ts";

import { Consumable } from "../types.ts";
import {
  UUIDColumn,
  VarcharColumn,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.0/other/Columns.ts";

export default class PlayerEntity extends BaseEntity {
  public session = new UUIDColumn("session", true);
  public username = new VarcharColumn("username", true);

  public taken: Consumable = {
    sips: 0,
    shots: 0,
  };

  public remaining: Consumable = {
    sips: 0,
    shots: 0,
  };

  public giveable: Consumable = {
    sips: 0,
    shots: 0,
  };
}
