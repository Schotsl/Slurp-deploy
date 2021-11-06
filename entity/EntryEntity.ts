import BaseEntity from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/entity/BaseEntity.ts";

export default class EntryEntity extends BaseEntity {
  public player: string | undefined;
  public shots: number | undefined;
  public sips: number | undefined;
}
