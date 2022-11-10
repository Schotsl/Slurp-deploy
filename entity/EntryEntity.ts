import BaseEntity from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.0/main/entity/BaseEntity.ts";

import {
  BooleanColumn,
  SmallColumn,
  UUIDColumn,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.0/main/other/Columns.ts";

export default class EntryEntity extends BaseEntity {
  public sips = new SmallColumn("sips", true, 0);
  public shots = new SmallColumn("shots", true, 0);
  public player = new UUIDColumn("player", true);

  public giveable = new BooleanColumn("giveable", true, false);
  public transfer = new BooleanColumn("transfer", true, false);
}
