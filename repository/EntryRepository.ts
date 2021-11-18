import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import {
  MissingImplementation,
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
    server: string,
  ): Promise<EntryCollection> {
    const promises = [];

    promises.push(this.mysqlClient.execute(
      `SELECT HEX(entry.uuid) AS uuid, HEX(entry.player) AS player, HEX(entry.server) AS server, entry.shots, entry.sips, entry.giveable, entry.created FROM entry WHERE entry.server = UNHEX(REPLACE(?, '-', '')) ORDER BY entry.created DESC LIMIT ? OFFSET ?`,
      [server, limit, offset],
    ));

    promises.push(this.mysqlClient.execute(
      `SELECT COUNT(entry.uuid) AS total FROM entry`,
    ));

    const data = await Promise.all(promises);
    const rows = data[0].rows!;
    const total = data[1].rows![0].total;

    return this.entryMapper.mapCollection(rows, offset, limit, total);
  }

  public updateObject(): Promise<EntryEntity> {
    throw new MissingImplementation();
  }

  public async removeObject(uuid: string, server: string): Promise<void> {
    const deleteResult = await this.mysqlClient.execute(
      `DELETE FROM entry WHERE entry.uuid = UNHEX(REPLACE(?, '-', '')) AND entry.server = UNHEX(REPLACE(?, '-', ''))`,
      [uuid, server],
    );

    if (deleteResult.affectedRows === 0) {
      throw new MissingResource("entry");
    }
  }

  public async addObject(object: EntryEntity): Promise<EntryEntity> {
    const sips = object.sips ? object.sips : 0;
    const shots = object.shots ? object.shots : 0;
    const giveable = object.giveable ? object.giveable : 0;

    await this.mysqlClient.execute(
      `INSERT INTO entry (uuid, player, server, giveable, shots, sips) VALUES(UNHEX(REPLACE(?, '-', '')), UNHEX(REPLACE(?, '-', '')), UNHEX(REPLACE(?, '-', '')), ?, ?, ?)`,
      [
        object.uuid,
        object.player,
        object.server,
        giveable,
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
      `SELECT HEX(entry.uuid) AS uuid, HEX(entry.player) AS player, HEX(entry.server) AS server, shots, sips, giveable, entry.created FROM entry WHERE entry.uuid = UNHEX(REPLACE(?, '-', ''))`,
      [uuid],
    );

    if (typeof data.rows === "undefined" || data.rows.length === 0) {
      throw new MissingResource("entry");
    }

    const row = data.rows![0];
    return this.entryMapper.mapObject(row);
  }
}
