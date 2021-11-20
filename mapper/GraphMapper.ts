import { restoreUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";

import ColorHash from "https://deno.land/x/color_hash@v2.0.0/mod.ts";
import GraphEntity from "../entity/GraphEntity.ts";
import GraphCollection from "../collection/GraphCollection.ts";
import InterfaceMapper from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/mapper/InterfaceMapper.ts";

export default class GraphMapper implements InterfaceMapper {
  public async mapObject(row: Record<string, never>): Promise<GraphEntity> {
    const uuid = restoreUUID(row.uuid);
    const hasher = new ColorHash();
    const entry = new GraphEntity(uuid);
    const response = await fetch(
      `https://api.mojang.com/user/profiles/${uuid}/names`,
    );

    console.log(response.status);
    console.log(response.json());
    // Get the latest name object from a sorted list of username history
    const parsed = await response.json();
    const user = parsed[parsed.length - 1];

    entry.color = hasher.hex(uuid);
    entry.server = restoreUUID(row.server);
    entry.username = user.name;

    return entry;
  }

  public async mapArray(
    rows: Record<string, never>[],
  ): Promise<GraphEntity[]> {
    // TODO: This function could probably be rewritten

    const found: string[] = [];
    const users = await Promise.all(
      rows.filter((row) => {
        if (!found.includes(row.uuid)) {
          found.push(row.uuid);
          return row;
        }
      }).map(async (row) => {
        return await this.mapObject(row);
      }),
    );

    rows.forEach((row) => {
      const index = found.findIndex((uuid) => uuid === row.uuid);
      const user = users[index]!;
      const time = row.time;
      const taken = {
        sips: parseInt(row.sips_taken),
        shots: parseInt(row.shots_taken),
      };

      const remaining = {
        sips: parseInt(row.sips_remaining),
        shots: parseInt(row.shots_remaining),
      };

      user.timeline.push({ time, taken, remaining });
    });

    return users;
  }

  public async mapCollection(
    rows: Record<string, never>[],
    offset: number,
    limit: number,
    total: number,
  ): Promise<GraphCollection> {
    const players = await this.mapArray(rows);

    return {
      total,
      limit,
      offset,
      players,
    };
  }
}
