import BaseEntity from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/entity/BaseEntity.ts";

export interface Consumable {
  sips: number | undefined;
  shots: number | undefined;
}

export default class PlayerEntity extends BaseEntity {
  public color: string | undefined;
  public server: string | undefined;
  public username: string | undefined;

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
