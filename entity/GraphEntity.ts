import BareEntity from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/entity/BareEntity.ts";

import { Consumable } from "./PlayerEntity.ts";

interface Timeslice {
  hour: string | undefined;
  taken: Consumable;
  remaining: Consumable;
}

export default class GraphEntity extends BareEntity {
  public color: string | undefined;
  public server: string | undefined;
  public username: string | undefined;
  public timeline: Timeslice[] = [];
}
