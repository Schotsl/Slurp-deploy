import BaseEntity from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/entity/BaseEntity.ts";

interface Consumable {
  sips: number | undefined;
  shots: number | undefined;
}

export default class PlayerEntity extends BaseEntity {
  public server: string | undefined;

  public taken: Consumable = {
    sips: undefined,
    shots: undefined,
  };

  public remaining: Consumable = {
    sips: undefined,
    shots: undefined,
  };
}
