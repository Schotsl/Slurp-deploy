import BaseEntity from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/entity/BaseEntity.ts";

import { UUIDColumn, VarcharColumn } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/other/Columns.ts";

export interface Consumable {
  sips: number;
  shots: number;
}

export default class PlayerEntity extends BaseEntity {
  public server = new UUIDColumn("server", true);
  public username = new VarcharColumn("name", true);

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
