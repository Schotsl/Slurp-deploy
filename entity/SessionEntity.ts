import BaseEntity from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/entity/BaseEntity.ts";

import {
  VarcharColumn,
  BooleanColumn,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/other/Columns.ts";

export default class SessionEntity extends BaseEntity {
  public short = new VarcharColumn("short");
  public active = new BooleanColumn("active", true, true);
}
