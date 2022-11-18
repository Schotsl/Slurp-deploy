import BaseEntity from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.2/entity/BaseEntity.ts";

import {
  BooleanColumn,
  VarcharColumn,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.2/other/Columns.ts";

export default class SessionEntity extends BaseEntity {
  public short = new VarcharColumn("short");
  public active = new BooleanColumn("active", true, true);
}
