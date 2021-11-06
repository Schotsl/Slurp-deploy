import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import {
  DuplicateResource,
  MissingResource,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";

import EntryEntity from "../entity/EntryEntity.ts";
import EntryMapper from "../mapper/EntryMapper.ts";
import EntryCollection from "../collection/EntryCollection.ts";
import InterfaceRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/repository/InterfaceRepository.ts";

export default class EntryRepository implements InterfaceRepository {
  private mysqlClient: Client;
  private entryMapper: EntryMapper;

  constructor(mysqlClient: Client) {
    this.mysqlClient = mysqlClient;
    this.entryMapper = new EntryMapper();
  }

  public async getCollection(
    offset: number,
    limit: number,
  ): Promise<EntryCollection> {
    const promises = [];

    promises.push(this.mysqlClient.execute(
      `SELECT HEX(entry.uuid) AS uuid, HEX(entry.player) AS player, shots, sips, entry.created, entry.updated FROM entry ORDER BY entry.created DESC LIMIT ? OFFSET ?`,
      [limit, offset],
    ));

    promises.push(this.mysqlClient.execute(
      `SELECT COUNT(entry.uuid) AS total FROM entry`,
    ));

    const data = await Promise.all(promises);
    const rows = data[0].rows!;
    const total = data[1].rows![0].total;

    return this.entryMapper.mapCollection(rows, offset, limit, total);
  }

  public async updateObject(
    object: Partial<EntryEntity>,
  ): Promise<EntryEntity> {
    const values = [];
    const exclude = ["created", "updated", "uuid"];

    let query = "UPDATE entry SET";

    for (const [key, value] of Object.entries(object)) {
      if (value !== null && !exclude.includes(key)) {
        query += ` ${key}=?,`;
        values.push(value);
      }
    }

    if (object.player !== null) {
      query += ` player=UNHEX(REPLACE(?, '-', '')),`;
      values.push(object.player);
    }

    if (values.length > 0) {
      query = query.slice(0, -1);
      query += " WHERE entry.uuid = UNHEX(REPLACE(?, '-', ''))";

      await this.mysqlClient.execute(query, [...values, object.uuid]);
    }

    const data = await this.getObject(object.uuid!);
    return data!;
  }

  public async removeObject(uuid: string): Promise<void> {
    const deleteResult = await this.mysqlClient.execute(
      `DELETE FROM entry WHERE entry.uuid = UNHEX(REPLACE(?, '-', ''))`,
      [uuid],
    );

    if (deleteResult.affectedRows === 0) {
      throw new MissingResource("entry");
    }
  }

  public async addObject(object: EntryEntity): Promise<EntryEntity> {
    const sips = object.sips ? object.sips : 0;
    const shots = object.shots ? object.shots : 0;

    await this.mysqlClient.execute(
      `INSERT INTO entry (uuid, player, shots, sips) VALUES(UNHEX(REPLACE(?, '-', '')), UNHEX(REPLACE(?, '-', '')), ?, ?)`,
      [
        object.uuid,
        object.player,
        shots,
        sips,
      ],
    ).catch((error: Error) => {
      const message = error.message;
      const ending = message.slice(-23);

      if (ending === "for key 'entry.entry'") {
        throw new DuplicateResource("entry");
      }

      throw error;
    });

    const result = await this.getObject(object.uuid);
    return result!;
  }

  public async getObject(uuid: string): Promise<EntryEntity> {
    const data = await this.mysqlClient.execute(
      `SELECT HEX(entry.uuid) AS uuid, HEX(entry.player) AS player, shots, sips, entry.created, entry.updated FROM entry WHERE entry.uuid = UNHEX(REPLACE(?, '-', ''))`,
      [uuid],
    );

    if (typeof data.rows === "undefined" || data.rows.length === 0) {
      throw new MissingResource("entry");
    }

    const row = data.rows![0];
    return this.entryMapper.mapObject(row);
  }
}
