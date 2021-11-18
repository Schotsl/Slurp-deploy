import BaseEntity from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/entity/BaseEntity.ts";

export default class EntryEntity extends BaseEntity {
  public server: string | undefined;
  public player: string | undefined;

  public sips: number | undefined;
  public shots: number | undefined;
  
  public giveable: boolean | undefined;
}
