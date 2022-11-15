import mysqlClient from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.1/services/mysqlClient.ts";
import PlayerRepository from "./repository/PlayerRepository.ts";

import { Consumable, Listener } from "./types.ts";

interface ListenerPersonal extends Listener {
  taken: Consumable;
  giveable: Consumable;
  remaining: Consumable;
}

class ManagerPersonal {
  playerRepository: PlayerRepository;
  listenersPersonal: ListenerPersonal[] = [];

  constructor() {
    this.playerRepository = new PlayerRepository("player");
  }

  async addListener(client: WebSocket, uuid: string) {
    this.playerRepository.getObject(uuid);

    const personal = {
      uuid,
      client,
      taken: { sips: 0, shots: 0 },
      giveable: { sips: 0, shots: 0 },
      remaining: { sips: 0, shots: 0 },
    };

    this.listenersPersonal.push(personal);

    await this.updateStorage(personal.uuid);
  }

  async updateStorage(uuid: string) {
    const result = await mysqlClient.query(
      "SELECT IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.giveable = 0), 0) AS remaining_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.giveable = 0), 0) AS remaining_shots, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.giveable = 1), 0) AS giveable_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.giveable = 1), 0) AS giveable_shots, IFNULL(-(SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.giveable = 0 AND entry.transfer = 0 AND entry.sips < 0), 0) AS taken_sips, IFNULL(-(SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.giveable = 0 AND entry.transfer = 0 AND entry.shots < 0), 0) AS taken_shots FROM player WHERE uuid = UNHEX(REPLACE(?, '-', ''))",
      [uuid],
    );

    const index = this.listenersPersonal.findIndex((listener) =>
      listener.uuid == uuid
    );

    this.listenersPersonal[index].taken = {
      sips: result[0].taken_sips,
      shots: result[0].taken_shots,
    };

    this.listenersPersonal[index].giveable = {
      sips: result[0].taken_sips,
      shots: result[0].taken_shots,
    };

    this.listenersPersonal[index].remaining = {
      sips: result[0].remaining_sips,
      shots: result[0].remaining_shots,
    };

    this.sendListener(this.listenersPersonal[index]);
  }

  private sendListener(listener: ListenerPersonal) {
    const {
      taken,
      client,
      giveable,
      remaining,
    } = listener;

    const body = { taken, giveable, remaining };
    const json = JSON.stringify(body);

    client.send(json);
  }
}

const managerPersonal = new ManagerPersonal();

export default managerPersonal;
