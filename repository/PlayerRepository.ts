import { MissingResource } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";

import mysqlClient from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/services/mysqlClient.ts";
import PlayerEntity from "../entity/PlayerEntity.ts";
import PlayerMapper from "../mapper/PlayerMapper.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";
import GeneralRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/repository/GeneralRepository.ts";
import InterfaceRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/repository/InterfaceRepository.ts";

export default class PlayerRepository implements InterfaceRepository {
  private generalName: string;
  private playerMapper: PlayerMapper;
  private generalRepository: GeneralRepository;

  constructor(
    name: string,
  ) {
    this.generalName = name;
    this.playerMapper = new PlayerMapper();
    this.generalRepository = new GeneralRepository(
      name,
      PlayerEntity,
      PlayerCollection,
    );
  }

  public async getCollection(
    offset: number,
    limit: number,
    server: string,
  ): Promise<PlayerCollection> {
    const fetch =
      "SELECT HEX(`uuid`) AS `uuid`, HEX(`server`) AS `server`, `username`, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0), 0) AS remaining_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0), 0) AS remaining_shots, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 1), 0) AS giveable_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 1), 0) AS giveable_shots, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0 AND entry.transfer = 0 AND entry.sips < 0), 0) AS taken_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0 AND entry.transfer = 0 AND entry.shots < 0), 0) AS taken_shots, `created`, `updated` FROM player WHERE player.server = UNHEX(REPLACE(?, '-', '')) ORDER BY created DESC LIMIT ? OFFSET ?";
    const count =
      "SELECT COUNT(uuid) AS total FROM player WHERE player.server = UNHEX(REPLACE(?, '-', ''))";

    const promises = [
      mysqlClient.execute(fetch, [server, limit, offset]),
      mysqlClient.execute(count, [server]),
    ];

    const data = await Promise.all(promises);
    const rows = data[0].rows!;
    const total = data[1].rows![0].total;

    return this.playerMapper.mapCollection(
      rows,
      offset,
      limit,
      total,
    ) as PlayerCollection;
  }

  public async removeObject(uuid: string): Promise<void> {
    return await this.generalRepository.removeObject(uuid);
  }

  public async addObject(object: PlayerEntity): Promise<PlayerEntity> {
    return await this.generalRepository.addObject(object) as PlayerEntity;
  }

  public async getObject(uuid: string, server: string): Promise<PlayerEntity> {
    const get =
      "SELECT HEX(`uuid`) AS `uuid`, HEX(`server`) AS `server`, `username`, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0), 0) AS remaining_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0), 0) AS remaining_shots, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 1), 0) AS giveable_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 1), 0) AS giveable_shots, IFNULL(-(SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0 AND entry.transfer = 0 AND entry.sips < 0), 0) AS taken_sips, IFNULL(-(SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0 AND entry.transfer = 0 AND entry.shots < 0), 0) AS taken_shots, `created`, `updated` FROM player WHERE uuid = UNHEX(REPLACE(?, '-', '')) AND server = UNHEX(REPLACE(?, '-', ''))";
    const data = await mysqlClient.execute(get, [uuid, server]);

    if (typeof data.rows === "undefined" || data.rows.length === 0) {
      throw new MissingResource(this.generalName);
    }

    const row = data.rows![0];
    return this.playerMapper.mapObject(row) as PlayerEntity;
  }
}
