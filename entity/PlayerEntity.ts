import BaseEntity from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/entity/BaseEntity.ts";

export default class PlayerEntity extends BaseEntity {
  public player: string | undefined;
  public server: string | undefined;
}
