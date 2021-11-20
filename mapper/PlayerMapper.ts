import { restoreUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";

import ColorHash from "https://deno.land/x/color_hash@v2.0.0/mod.ts";
import PlayerEntity from "../entity/PlayerEntity.ts";
import InterfaceMapper from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/mapper/InterfaceMapper.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";

export default class PlayerMapper implements InterfaceMapper {
  public async mapObject(row: Record<string, never>): Promise<PlayerEntity> {
    const uuid = restoreUUID(row.uuid);
    const hasher = new ColorHash();
    const player = new PlayerEntity(uuid);
    const response = await fetch(
      `https://api.mojang.com/user/profiles/${uuid}/names`,
    );

    // Get the latest name object from a sorted list of username history
    const parsed = await response.json();
    const user = parsed[parsed.length - 1];

    player.color = hasher.hex(uuid);
    player.server = restoreUUID(row.server);
    player.username = response.status === 200 ? user.name : "Oops!";

    player.taken.sips = parseInt(row.sips_taken);
    player.taken.shots = parseInt(row.shots_taken);

    player.giveable.sips = parseInt(row.shots_giveable);
    player.giveable.shots = parseInt(row.sips_giveable);

    player.remaining.sips = parseInt(row.sips_remaining);
    player.remaining.shots = parseInt(row.shots_remaining);

    player.created = row.created;
    player.updated = row.updated;

    return player;
  }

  public async mapArray(
    rows: Record<string, never>[],
  ): Promise<PlayerEntity[]> {
    const entries = await Promise.all(rows.map((row) => this.mapObject(row)));
    return entries;
  }

  public async mapCollection(
    rows: Record<string, never>[],
    offset: number,
    limit: number,
    total: number,
  ): Promise<PlayerCollection> {
    const players = await this.mapArray(rows);

    return {
      total,
      limit,
      offset,
      players,
    };
  }
}
