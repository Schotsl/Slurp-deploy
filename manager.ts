import mysqlClient from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/services/mysqlClient.ts";

import { verifyToken } from "./middleware.ts";
import { restoreUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";
import PlayerRepository from "./repository/PlayerRepository.ts";
// interface Summary {
//   uuid: string;
//   sips: string;
//   shots: string;
//   username: string;
// }

// interface Session {
//   uuid: string;
//   type: Type;
//   taken: Summary[];
//   graphs: Summary[];
//   clients: WebSocket[];
//   remaining: Summary[];
// }

// enum Fields {
//   All = "all",
//   Taken = "taken",
//   Graphs = "gra",
//   Remaining = "re",
// }

export interface Consumable {
  sips: number;
  shots: number;
}

enum Type {
  Session = 0,
  Personal = 1,
}

interface Listener {
  uuid: string;
  client: WebSocket;
}

interface ListenerPersonal extends Listener {
  taken: Consumable;
  giveable: Consumable;
  remaining: Consumable;
}

class Manager {
  playerRepository: PlayerRepository;

  listenersPersonal: ListenerPersonal[] = [];

  constructor() {
    this.playerRepository = new PlayerRepository("player");
  }

  async addPersonal(client: WebSocket, uuid: string) {
    this.playerRepository.getObject(uuid);

    const personal = {
      uuid,
      client,
      taken: { sips: 0, shots: 0 },
      giveable: { sips: 0, shots: 0 },
      remaining: { sips: 0, shots: 0 },
    };
    
    this.listenersPersonal.push(personal);

    await this.updatePersonal(personal.uuid);
  }

  async updatePersonal(uuid: string) {
    const result = await mysqlClient.query(
      "SELECT IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.giveable = 0), 0) AS remaining_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.giveable = 0), 0) AS remaining_shots, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.giveable = 1), 0) AS giveable_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.giveable = 1), 0) AS giveable_shots, IFNULL(-(SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.giveable = 0 AND entry.transfer = 0 AND entry.sips < 0), 0) AS taken_sips, IFNULL(-(SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.giveable = 0 AND entry.transfer = 0 AND entry.shots < 0), 0) AS taken_shots FROM player WHERE uuid = UNHEX(REPLACE(?, '-', ''))",
      [uuid],
    );

    const index = this.listenersPersonal.findIndex(
      (listener) => listener.uuid == uuid,
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

    this.sendPersonal(this.listenersPersonal[index]);
  }

  sendPersonal(listener: ListenerPersonal) {
    const {
      taken,
      client,
      giveable,
      remaining
    } = listener;
    
    const body = { taken, giveable, remaining };
    const json = JSON.stringify(body);

    client.send(json);
  }

  // sendPersonal() {

  // }

  // async storeClient(uuid: string, client: WebSocket) {
  //   const session = this.sessions.find((session) => session.uuid === uuid);

  //   if (typeof session !== "undefined") {
  //     session.clients.push(client);
  //     this.updateClient(session, Fields.All, client);
  //     return;
  //   }

  //   // If we creating a new session
  //   const clients = [client];
  //   const taken = await this.fetchTaken(uuid);
  //   const graphs = await this.fetchGraph(uuid);
  //   const remaining = await this.fetchRemaining(uuid);
  //   const object = { uuid, clients, taken, graphs, remaining };

  //   this.sessions.push(object);
  //   this.updateClient(object, Fields.All, client);
  // }

  // updateClient(session: Session, field: Fields, client?: WebSocket) {
  //   const data = field === Fields.All
  //     ? this.fetchAll(session)
  //     : this.fetchField(session, field);
  //   const body = JSON.stringify(data);

  //   if (typeof client !== "undefined") {
  //     client.send(body);
  //     return;
  //   }

  //   session.clients.forEach((client) => {
  //     if (client.readyState === WebSocket.OPEN) {
  //       client.send(body);
  //     }
  //   });
  // }

  // fetchAll(session: Session) {
  //   return {
  //     taken: session.taken,
  //     graphs: session.graphs,
  //     remaining: session.remaining,
  //   };
  // }

  // fetchField(session: Session, field: Fields) {
  //   if (field === Fields.Taken) {
  //     return { taken: session.taken };
  //   }

  //   if (field === Fields.Remaining) {
  //     return { remaining: session.remaining };
  //   }

  //   if (field === Fields.Graphs) {
  //     return { graphs: session.graphs };
  //   }
  // }

  // async fetchTaken(uuid: string): Promise<Summary[]> {
  //   const result = await mysqlClient.execute(
  //     "SELECT HEX(`uuid`) AS `uuid`, `username`, IFNULL(-(SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.session = player.session AND entry.giveable = 0 AND entry.transfer = 0 AND entry.sips < 0), 0) AS taken_sips, IFNULL(-(SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.session = player.session AND entry.giveable = 0 AND entry.transfer = 0 AND entry.shots < 0), 0) AS taken_shots FROM player WHERE session = UNHEX(REPLACE(?, '-', ''))",
  //     [uuid],
  //   );

  //   return result.rows!.map((row) => {
  //     const uuid = restoreUUID(row.uuid);

  //     const taken_sips = parseInt(row.taken_sips);
  //     const taken_shots = parseInt(row.taken_shots);

  //     return { ...row, taken_sips, taken_shots, uuid };
  //   });
  // }

  // async fetchRemaining(uuid: string): Promise<Summary[]> {
  //   const result = await mysqlClient.execute(
  //     "SELECT HEX(`uuid`) AS `uuid`, `username`, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.session = player.session AND entry.giveable = 0), 0) AS remaining_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.session = player.session AND entry.giveable = 0), 0) AS remaining_shots FROM player WHERE session = UNHEX(REPLACE(?, '-', ''))",
  //     [uuid],
  //   );

  //   return result.rows!.map((row) => {
  //     const uuid = restoreUUID(row.uuid);

  //     const remaining_sips = parseInt(row.remaining_sips);
  //     const remaining_shots = parseInt(row.remaining_shots);

  //     return { ...row, remaining_sips, remaining_shots, uuid };
  //   });
  // }

  // async fetchGraph(uuid: string): Promise<Summary[]> {
  //   const result = await mysqlClient.execute(
  //     "SELECT TIMESTAMP(CONCAT(YEAR(entry.created), '-', MONTH(entry.created), '-' , DAYOFMONTH(entry.created), ' ', HOUR(entry.created), ':', (FLOOR(MINUTE(entry.created) / 10) * 10), ':00')) AS timestamp, HEX(player.uuid) AS uuid, player.username, -SUM(entry.sips) AS sips, -SUM(entry.shots) AS shots FROM entry INNER JOIN player ON (player.uuid, player.session) = (entry.player, entry.session) WHERE player.session = UNHEX(REPLACE(?, '-', '')) AND entry.giveable = 0 AND entry.transfer = 0 AND entry.created >= DATE_SUB(NOW(), INTERVAL 12 HOUR) AND (entry.sips < 0 OR entry.shots < 0) GROUP BY timestamp, entry.player;",
  //     [uuid],
  //   );

  //   return result.rows!.map((row) => {
  //     const uuid = restoreUUID(row.uuid);

  //     const sips = parseInt(row.sips);
  //     const shots = parseInt(row.shots);

  //     return { ...row, sips, shots, uuid };
  //   });
  // }

  // async updateTaken(uuid: string): Promise<void> {
  //   const session = this.findSession(uuid);

  //   if (typeof session !== "undefined") {
  //     const taken = await this.fetchTaken(uuid);

  //     session.taken = taken;

  //     this.updateClient(session, Fields.Taken);
  //   }
  // }

  // async updateRemaining(uuid: string): Promise<void> {
  //   const session = this.findSession(uuid);

  //   if (typeof session !== "undefined") {
  //     const remaining = await this.fetchRemaining(uuid);

  //     session.remaining = remaining;

  //     this.updateClient(session, Fields.Remaining);
  //   }
  // }

  // async updateGraph(uuid: string): Promise<void> {
  //   const session = this.findSession(uuid);

  //   if (typeof session !== "undefined") {
  //     const graphs = await this.fetchGraph(uuid);

  //     session.graphs = graphs;

  //     this.updateClient(session, Fields.Graphs);
  //   }
  // }
}

const manager = new Manager();

export default manager;
