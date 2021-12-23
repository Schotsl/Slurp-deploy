import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { ColumnInfo } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/types.ts";
import { UUIDColumn } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/other/Columns.ts";
import { generateColumns } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";
import { MissingResource } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";

import Querries from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/other/Querries.ts";
import PlayerEntity from "../entity/PlayerEntity.ts";
import PlayerMapper from "../mapper/PlayerMapper.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";
import GeneralRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/repository/GeneralRepository.ts";
import InterfaceRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/repository/InterfaceRepository.ts";

export default class PlayerRepository implements InterfaceRepository {
  private generalName: string;
  private generalMapper: PlayerMapper;
  private generalColumns: ColumnInfo[] = [];
  private generalRepository: GeneralRepository;

  private mysqlClient: Client;
  private queryClient: Querries;

  constructor(
    mysqlClient: Client,
    name: string,
    Entity: { new (): PlayerEntity },
    Collection: { new (): PlayerCollection },
  ) {
    this.generalName = name;
    this.generalMapper = new PlayerMapper(Entity);
    this.generalColumns = generateColumns(Entity);
    this.generalRepository = new GeneralRepository(
      mysqlClient,
      name,
      Entity,
      Collection,
    );

    this.mysqlClient = mysqlClient;
    this.queryClient = new Querries(this.generalColumns, this.generalName);
  }

  public async getCollection(
    offset: number,
    limit: number,
  ): Promise<PlayerCollection> {
    const fetch =
      "SELECT HEX(`uuid`) AS `uuid`, HEX(`server`) AS `server`, `username`, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0), 0) AS remaining_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0), 0) AS remaining_shots, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 1), 0) AS giveable_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 1), 0) AS giveable_shots, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0 AND entry.transfer = 0 AND entry.sips < 0), 0) AS taken_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0 AND entry.transfer = 0 AND entry.shots < 0), 0) AS taken_shots, `created`, `updated` FROM player ORDER BY created DESC LIMIT ? OFFSET ?";
    const count = this.queryClient.countQuery();

    const promises = [
      this.mysqlClient.execute(fetch, [limit, offset]),
      this.mysqlClient.execute(count),
    ];

    const data = await Promise.all(promises);
    const rows = data[0].rows!;
    const total = data[1].rows![0].total;

    return this.generalMapper.mapCollection(rows, offset, limit, total);
  }

  public async removeObject(uuid: string): Promise<void> {
    return await this.generalRepository.removeObject(uuid);
  }

  public async addObject(object: PlayerEntity): Promise<PlayerEntity> {
    return await this.generalRepository.addObject(object) as PlayerEntity;
  }

  public async getObject(uuid: string): Promise<PlayerEntity> {
    const get =
      "SELECT HEX(`uuid`) AS `uuid`, HEX(`server`) AS `server`, `username`, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0), 0) AS remaining_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0), 0) AS remaining_shots, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 1), 0) AS giveable_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 1), 0) AS giveable_shots, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0 AND entry.transfer = 0 AND entry.sips < 0), 0) AS taken_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0 AND entry.transfer = 0 AND entry.shots < 0), 0) AS taken_shots, `created`, `updated` FROM player WHERE uuid = UNHEX(REPLACE(?, '-', ''))";
    const data = await this.mysqlClient.execute(get, [uuid]);

    if (typeof data.rows === "undefined" || data.rows.length === 0) {
      throw new MissingResource(this.generalName);
    }

    const row = data.rows![0];
    return this.generalMapper.mapObject(row);
  }
}
