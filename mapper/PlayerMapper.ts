import { restoreUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";

import PlayerEntity from "../entity/PlayerEntity.ts";
import InterfaceMapper from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/mapper/InterfaceMapper.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";

export default class PlayerMapper implements InterfaceMapper {
  public mapObject(row: Record<string, never>): PlayerEntity {
    const uuid = restoreUUID(row.uuid);
    const player = new PlayerEntity(uuid);

    player.player = restoreUUID(row.player);
    player.server = restoreUUID(row.server);

    player.created = row.created;
    player.updated = row.updated;

    return player;
  }

  public mapArray(
    rows: Record<string, never>[],
  ): PlayerEntity[] {
    const entries = rows.map((row) => this.mapObject(row));
    return entries;
  }

  public mapCollection(
    rows: Record<string, never>[],
    offset: number,
    limit: number,
    total: number,
  ): PlayerCollection {
    const players = this.mapArray(rows);

    return {
      total,
      limit,
      offset,
      players,
    };
  }
}
