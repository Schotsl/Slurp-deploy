import BaseEntity from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/entity/BaseEntity.ts";

import {
  BooleanColumn,
  SmallColumn,
  UUIDColumn,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/other/Columns.ts";

export default class EntryEntity extends BaseEntity {
  public server = new UUIDColumn("server", true);
  public player = new UUIDColumn("player", true);

  public sips = new SmallColumn("sips", true);
  public shots = new SmallColumn("shots", true);
  public giveable = new BooleanColumn("giveable", true);
}
