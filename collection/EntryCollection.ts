import BaseCollection from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.0/collection/BaseCollection.ts";
import EntryEntity from "../entity/EntryEntity.ts";

export default class EntryCollection extends BaseCollection {
  public entries: EntryEntity[] = [];
}
