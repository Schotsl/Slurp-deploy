import BaseEntity from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/entity/BaseEntity.ts";

import { BooleanColumn, VarcharColumn } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/other/Columns.ts";

export default class SessionEntity extends BaseEntity {
  public shortcode = new VarcharColumn("shortcode");
  public active = new BooleanColumn("active", true, true);
}
