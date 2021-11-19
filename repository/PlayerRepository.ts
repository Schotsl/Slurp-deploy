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
    server: string,
  ): Promise<PlayerCollection> {
    const promises = [];

    promises.push(this.mysqlClient.execute(
      `SELECT HEX(player.uuid) AS uuid, HEX(player.server) AS server, player.created, player.updated, IFNULL(sips_taken, 0) AS sips_taken, IFNULL(shots_taken, 0) AS shots_taken, IFNULL(sips_giveable, 0) AS sips_giveable, IFNULL(sips_remaining, 0) AS sips_remaining, IFNULL(shots_giveable, 0) AS shots_giveable, IFNULL(shots_remaining, 0) AS shots_remaining FROM player LEFT JOIN ( SELECT entry.player, SUM(CASE WHEN entry.giveable = 1 THEN entry.sips ELSE 0 END) AS sips_giveable, SUM(CASE WHEN entry.giveable = 1 THEN entry.shots ELSE 0 END) AS shots_giveable, SUM(CASE WHEN entry.giveable = 0 THEN entry.sips ELSE 0 END) AS sips_remaining, SUM(CASE WHEN entry.giveable = 0 THEN entry.shots ELSE 0 END) AS shots_remaining, -SUM(CASE WHEN entry.sips < 0 AND entry.giveable = 0 THEN entry.sips ELSE 0 END) as sips_taken, -SUM(CASE WHEN entry.shots < 0 AND entry.giveable = 0 THEN entry.shots ELSE 0 END) as shots_taken FROM entry WHERE entry.server = UNHEX(REPLACE(?, '-', '')) GROUP BY entry.player ) AS entry ON player.uuid = entry.player WHERE player.server = UNHEX(REPLACE(?, '-', '')) ORDER BY player.created DESC LIMIT ? OFFSET ?`,
      [server, server, limit, offset],
    ));

    promises.push(this.mysqlClient.execute(
      `SELECT COUNT(player.uuid) AS total FROM player WHERE player.server = UNHEX(REPLACE(?, '-', ''))`,
      [server],
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
    const exclude = [
      "created",
      "updated",
      "uuid",
      "server",
      "taken",
      "giveable",
      "remaining",
    ];

    let query = "UPDATE player SET";

    for (const [key, value] of Object.entries(object)) {
      if (value !== null && !exclude.includes(key)) {
        query += ` ${key}=?,`;
        values.push(value);
      }
    }

    // TODO: Make sure provided server is a valid UUID reference

    if (values.length > 0) {
      query = query.slice(0, -1);
      query +=
        " WHERE player.uuid = UNHEX(REPLACE(?, '-', '')) AND player.server = server(REPLACE(?, '-', ''))";

      await this.mysqlClient.execute(query, [
        ...values,
        object.uuid,
        object.server,
      ]);
    }

    const data = await this.getObject(object.uuid!, object.server!);
    return data!;
  }

  public async removeObject(uuid: string, server: string): Promise<void> {
    const deleteResult = await this.mysqlClient.execute(
      `DELETE FROM player WHERE player.uuid = UNHEX(REPLACE(?, '-', '')) AND player.server = UNHEX(REPLACE(?, '-', ''))`,
      [uuid, server],
    );

    if (deleteResult.affectedRows === 0) {
      throw new MissingResource("player");
    }
  }

  public async addObject(object: PlayerEntity): Promise<PlayerEntity> {
    await this.mysqlClient.execute(
      `INSERT INTO player (uuid, server) VALUES(UNHEX(REPLACE(?, '-', '')), UNHEX(REPLACE(?, '-', '')))`,
      [
        object.uuid,
        object.server,
      ],
    ).catch((error: Error) => {
      const message = error.message;
      const ending = message.slice(-24);

      if (ending === "for key 'player.PRIMARY'") {
        throw new DuplicateResource("player");
      }

      throw error;
    });

    const result = await this.getObject(object.uuid, object.server!);
    return result!;
  }

  public async getObject(uuid: string, server: string): Promise<PlayerEntity> {
    const data = await this.mysqlClient.execute(
      `SELECT HEX(player.uuid) AS uuid, HEX(player.server) AS server, player.created, player.updated, IFNULL(sips_taken, 0) AS sips_taken, IFNULL(shots_taken, 0) AS shots_taken, IFNULL(sips_giveable, 0) AS sips_giveable, IFNULL(sips_remaining, 0) AS sips_remaining, IFNULL(shots_giveable, 0) AS shots_giveable, IFNULL(shots_remaining, 0) AS shots_remaining FROM player LEFT JOIN ( SELECT entry.player, SUM(CASE WHEN entry.giveable = 1 THEN entry.sips ELSE 0 END) AS sips_giveable, SUM(CASE WHEN entry.giveable = 1 THEN entry.shots ELSE 0 END) AS shots_giveable, SUM(CASE WHEN entry.giveable = 0 THEN entry.sips ELSE 0 END) AS sips_remaining, SUM(CASE WHEN entry.giveable = 0 THEN entry.shots ELSE 0 END) AS shots_remaining, -SUM(CASE WHEN entry.sips < 0 AND entry.giveable = 0 THEN entry.sips ELSE 0 END) as sips_taken, -SUM(CASE WHEN entry.shots < 0 AND entry.giveable = 0 THEN entry.shots ELSE 0 END) as shots_taken FROM entry WHERE entry.server = UNHEX(REPLACE(?, '-', '')) GROUP BY entry.player ) AS entry ON player.uuid = entry.player WHERE player.server = UNHEX(REPLACE(?, '-', '')) AND player.uuid = UNHEX(REPLACE(?, '-', '')) ORDER BY player.created DESC`,
      [server, server, uuid],
    );

    if (typeof data.rows === "undefined" || data.rows.length === 0) {
      throw new MissingResource("player");
    }

    const row = data.rows![0];
    return this.playerMapper.mapObject(row);
  }
}
