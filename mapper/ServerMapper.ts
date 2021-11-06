import { restoreUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";

import ServerEntity from "../entity/ServerEntity.ts";
import InterfaceMapper from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/mapper/InterfaceMapper.ts";
import ServerCollection from "../collection/ServerCollection.ts";

export default class ServerMapper implements InterfaceMapper {
  public mapObject(row: Record<string, never>): ServerEntity {
    const uuid = restoreUUID(row.uuid);
    const server = new ServerEntity(uuid);

    server.created = row.created;
    server.updated = row.updated;

    return server;
  }

  public mapArray(
    rows: Record<string, never>[],
  ): ServerEntity[] {
    const entries = rows.map((row) => this.mapObject(row));
    return entries;
  }

  public mapCollection(
    rows: Record<string, never>[],
    offset: number,
    limit: number,
    total: number,
  ): ServerCollection {
    const servers = this.mapArray(rows);

    return {
      total,
      limit,
      offset,
      servers,
    };
  }
}
