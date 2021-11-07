import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { MissingImplementation } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";

import GraphEntity from "../entity/GraphEntity.ts";
import GraphMapper from "../mapper/GraphMapper.ts";
import GraphCollection from "../collection/GraphCollection.ts";
import InterfaceRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/repository/InterfaceRepository.ts";

export default class GraphRepository implements InterfaceRepository {
  private mysqlClient: Client;
  private serverMapper: GraphMapper;

  constructor(mysqlClient: Client) {
    this.mysqlClient = mysqlClient;
    this.serverMapper = new GraphMapper();
  }

  public async getCollection(): Promise<GraphCollection> {
    const promises = [];

    promises.push(this.mysqlClient.execute(
      `SELECT HEX(entry.player) as uuid, HEX(entry.server) as server, -SUM(CASE WHEN entry.shots < 0 THEN entry.shots ELSE 0 END) AS shots_taken, SUM(entry.shots) AS shots_remaining, -SUM(CASE WHEN entry.sips < 0 THEN entry.sips ELSE 0 END) AS sips_taken, SUM(entry.sips) AS sips_remaining, HOUR(entry.created) as hour FROM entry WHERE DATE_SUB(entry.created, INTERVAL 1 HOUR) GROUP BY HOUR(entry.created), entry.player, entry.server`,
    ));

    const data = await Promise.all(promises);
    const rows = data[0].rows!;

    return this.serverMapper.mapCollection(rows, -1, -1, -1);
  }

  public updateObject(): Promise<GraphEntity> {
    throw new MissingImplementation();
  }

  public removeObject(): Promise<void> {
    throw new MissingImplementation();
  }

  public addObject(): Promise<GraphEntity> {
    throw new MissingImplementation();
  }

  public getObject(): Promise<GraphEntity> {
    throw new MissingImplementation();
  }
}
