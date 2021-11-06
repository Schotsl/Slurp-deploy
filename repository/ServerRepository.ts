import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { MissingResource } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";

import ServerEntity from "../entity/ServerEntity.ts";
import ServerMapper from "../mapper/ServerMapper.ts";
import ServerCollection from "../collection/ServerCollection.ts";
import InterfaceRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/repository/InterfaceRepository.ts";

export default class ServerRepository implements InterfaceRepository {
  private mysqlClient: Client;
  private serverMapper: ServerMapper;

  constructor(mysqlClient: Client) {
    this.mysqlClient = mysqlClient;
    this.serverMapper = new ServerMapper();
  }

  public async getCollection(
    offset: number,
    limit: number,
  ): Promise<ServerCollection> {
    const promises = [];

    promises.push(this.mysqlClient.execute(
      `SELECT HEX(server.uuid) AS uuid, server.created, server.updated FROM server ORDER BY server.created DESC LIMIT ? OFFSET ?`,
      [limit, offset],
    ));

    promises.push(this.mysqlClient.execute(
      `SELECT COUNT(server.uuid) AS total FROM server`,
    ));

    const data = await Promise.all(promises);
    const rows = data[0].rows!;
    const total = data[1].rows![0].total;

    return this.serverMapper.mapCollection(rows, offset, limit, total);
  }

  public async updateObject(
    object: Partial<ServerEntity>,
  ): Promise<ServerEntity> {
    const values = [];
    const exclude = ["created", "updated", "uuid"];

    let query = "UPDATE server SET";

    for (const [key, value] of Object.entries(object)) {
      if (value !== null && !exclude.includes(key)) {
        query += ` ${key}=?,`;
        values.push(value);
      }
    }

    if (values.length > 0) {
      query = query.slice(0, -1);
      query += " WHERE server.uuid = UNHEX(REPLACE(?, '-', ''))";

      await this.mysqlClient.execute(query, [...values, object.uuid]);
    }

    const data = await this.getObject(object.uuid!);
    return data!;
  }

  public async removeObject(uuid: string): Promise<void> {
    const deleteResult = await this.mysqlClient.execute(
      `DELETE FROM server WHERE server.uuid = UNHEX(REPLACE(?, '-', ''))`,
      [uuid],
    );

    if (deleteResult.affectedRows === 0) {
      throw new MissingResource("server");
    }
  }

  public async addObject(object: ServerEntity): Promise<ServerEntity> {
    await this.mysqlClient.execute(
      `INSERT INTO server (uuid) VALUES(UNHEX(REPLACE(?, '-', '')))`,
      [
        object.uuid,
      ],
    );

    const result = await this.getObject(object.uuid);
    return result!;
  }

  public async getObject(uuid: string): Promise<ServerEntity> {
    const data = await this.mysqlClient.execute(
      `SELECT HEX(server.uuid) AS uuid, server.created, server.updated FROM server WHERE server.uuid = UNHEX(REPLACE(?, '-', ''))`,
      [uuid],
    );

    if (typeof data.rows === "undefined" || data.rows.length === 0) {
      throw new MissingResource("server");
    }

    const row = data.rows![0];
    return this.serverMapper.mapObject(row);
  }
}
