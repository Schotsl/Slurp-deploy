import BaseEntity from "../../Uberdeno/entity/BaseEntity.ts";

import { UUIDColumn, VarcharColumn } from "../../Uberdeno/other/Columns.ts";

export interface Consumable {
  sips: number | undefined;
  shots: number | undefined;
}

export default class PlayerEntity extends BaseEntity {
  public server = new UUIDColumn("server", true);
  public username = new VarcharColumn("name", true);

  public taken: Consumable = {
    sips: undefined,
    shots: undefined,
  };

  public remaining: Consumable = {
    sips: undefined,
    shots: undefined,
  };

  public giveable: Consumable = {
    sips: undefined,
    shots: undefined,
  };
}
