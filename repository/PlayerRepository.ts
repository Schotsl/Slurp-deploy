import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import {
  DuplicateResource,
  MissingResource,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";

import PlayerEntity from "../entity/PlayerEntity.ts";
import PlayerMapper from "../mapper/PlayerMapper.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";
import InterfaceRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/repository/InterfaceRepository.ts";

export default class PlayerRepository implements InterfaceRepository {
  private mysqlClient: Client;
  private playerMapper: PlayerMapper;

  constructor(mysqlClient: Client) {
    this.mysqlClient = mysqlClient;
    this.playerMapper = new PlayerMapper();
  }

  public async getCollection(
    offset: number,
    limit: number,
  ): Promise<PlayerCollection> {
    const promises = [];

    promises.push(this.mysqlClient.execute(
      `SELECT HEX(player.uuid) AS uuid, HEX(player.player) AS player, HEX(player.server) AS server, player.created, player.updated FROM player ORDER BY player.created DESC LIMIT ? OFFSET ?`,
      [limit, offset],
    ));

    promises.push(this.mysqlClient.execute(
      `SELECT COUNT(player.uuid) AS total FROM player`,
    ));

    const data = await Promise.all(promises);
    const rows = data[0].rows!;
    const total = data[1].rows![0].total;

    return this.playerMapper.mapCollection(rows, offset, limit, total);
  }

  public async updateObject(
    object: Partial<PlayerEntity>,
  ): Promise<PlayerEntity> {
    const values = [];
    const exclude = ["created", "updated", "uuid", "player", "server"];

    let query = "UPDATE player SET";

    for (const [key, value] of Object.entries(object)) {
      if (value !== null && !exclude.includes(key)) {
        query += ` ${key}=?,`;
        values.push(value);
      }
    }

    // TODO: Make sure provided server is a valid UUID reference

    if (object.player !== null) {
      query += ` player=UNHEX(REPLACE(?, '-', '')),`;
      values.push(object.player);
    }

    if (object.server !== null) {
      query += ` server=UNHEX(REPLACE(?, '-', '')),`;
      values.push(object.server);
    }

    if (values.length > 0) {
      query = query.slice(0, -1);
      query += " WHERE player.uuid = UNHEX(REPLACE(?, '-', ''))";

      await this.mysqlClient.execute(query, [...values, object.uuid]);
    }

    const data = await this.getObject(object.uuid!);
    return data!;
  }

  public async removeObject(uuid: string): Promise<void> {
    const deleteResult = await this.mysqlClient.execute(
      `DELETE FROM player WHERE player.uuid = UNHEX(REPLACE(?, '-', ''))`,
      [uuid],
    );

    if (deleteResult.affectedRows === 0) {
      throw new MissingResource("player");
    }
  }

  public async addObject(object: PlayerEntity): Promise<PlayerEntity> {
    await this.mysqlClient.execute(
      `INSERT INTO player (uuid, player, server) VALUES(UNHEX(REPLACE(?, '-', '')), UNHEX(REPLACE(?, '-', '')), UNHEX(REPLACE(?, '-', '')))`,
      [
        object.uuid,
        object.player,
        object.server,
      ],
    ).catch((error: Error) => {
      const message = error.message;
      const ending = message.slice(-23);

      if (ending === "for key 'player.player'") {
        throw new DuplicateResource("player");
      }

      throw error;
    });

    const result = await this.getObject(object.uuid);
    return result!;
  }

  public async getObject(uuid: string): Promise<PlayerEntity> {
    const data = await this.mysqlClient.execute(
      `SELECT HEX(player.uuid) AS uuid, HEX(player.player) AS player, HEX(player.server) AS server, player.created, player.updated FROM player WHERE uuid = UNHEX(REPLACE(?, '-', ''))`,
      [uuid],
    );

    if (typeof data.rows === "undefined" || data.rows.length === 0) {
      throw new MissingResource("player");
    }

    const row = data.rows![0];
    return this.playerMapper.mapObject(row);
  }
}
