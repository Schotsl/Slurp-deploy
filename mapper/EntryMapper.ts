import { restoreUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";

import EntryEntity from "../entity/EntryEntity.ts";
import InterfaceMapper from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/mapper/InterfaceMapper.ts";
import EntryCollection from "../collection/EntryCollection.ts";

export default class EntryMapper implements InterfaceMapper {
  public mapObject(row: Record<string, never>): EntryEntity {
    const uuid = restoreUUID(row.uuid);
    const entry = new EntryEntity(uuid);

    entry.player = restoreUUID(row.player);
    entry.server = restoreUUID(row.server);

    entry.sips = row.sips;
    entry.shots = row.shots;
    entry.giveable = row.giveable === 1;

    entry.created = row.created;

    return entry;
  }

  public mapArray(
    rows: Record<string, never>[],
  ): EntryEntity[] {
    const entries = rows.map((row) => this.mapObject(row));
    return entries;
  }

  public mapCollection(
    rows: Record<string, never>[],
    offset: number,
    limit: number,
    total: number,
  ): EntryCollection {
    const entries = this.mapArray(rows);

    return {
      total,
      limit,
      offset,
      entries,
    };
  }
}
