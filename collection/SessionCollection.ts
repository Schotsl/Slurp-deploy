import BaseCollection from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.0/main/collection/BaseCollection.ts";
import SessionEntity from "../entity/SessionEntity.ts";

export default class SessionCollection extends BaseCollection {
  public sessions: SessionEntity[] = [];
}
