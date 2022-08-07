import mysqlClient from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/services/mysqlClient.ts";

import { verifyToken } from "./middleware.ts";
import { restoreUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";

interface Summary {
  uuid: string;
  sips: string;
  shots: string;
  username: string;
}

interface Session {
  uuid: string;
  taken: Summary[];
  graphs: Summary[];
  clients: WebSocket[];
  remaining: Summary[];
}

enum Fields {
  All = "all",
  Taken = "taken",
  Graphs = "gra",
  Remaining = "re",
}

class Manager {
  sessions: Session[] = [];

  authenticateClient(client: WebSocket) {
    client.onopen = () => {
      client.send(`Please provide your Authorization header.`);
    };

    client.onmessage = async (message) => {
      const header = message.data;
      const regexp = new RegExp(/^Bearer (.*)$/);
      const result = regexp.test(header);

      if (!result) {
        client.send(`Your Authorization header is improperly formatted.`);
        return;
      }

      const token = header.split(" ")[1];

      try {
        const payload = await verifyToken(token);
        const session = payload.uuid as string;

        // Store the client for future session updates
        this.storeClient(session, client);

        // Disable the onmessage event
        client.onmessage = () => {};
        client.send(`Authorized successfully!`);
      } catch {
        client.send(`Your token is invalid.`);
        return;
      }
    };
  }

  findSession(uuid: string) {
    return this.sessions.find((session) => session.uuid === uuid);
  }

  async storeClient(uuid: string, client: WebSocket) {
    const session = this.sessions.find((session) => session.uuid === uuid);

    if (typeof session !== "undefined") {
      session.clients.push(client);
      this.updateClient(session, Fields.All, client);
      return;
    }

    // If we creating a new session
    const clients = [client];
    const taken = await this.fetchTaken(uuid);
    const graphs = await this.fetchGraph(uuid);
    const remaining = await this.fetchRemaining(uuid);
    const object = { uuid, clients, taken, graphs, remaining };

    this.sessions.push(object);
    this.updateClient(object, Fields.All, client);
  }

  updateClient(session: Session, field: Fields, client?: WebSocket) {
    const data = field === Fields.All
      ? this.fetchAll(session)
      : this.fetchField(session, field);
    const body = JSON.stringify(data);

    if (typeof client !== "undefined") {
      client.send(body);
      return;
    }

    session.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(body);
      }
    });
  }

  fetchAll(session: Session) {
    return {
      taken: session.taken,
      graphs: session.graphs,
      remaining: session.remaining,
    };
  }

  fetchField(session: Session, field: Fields) {
    if (field === Fields.Taken) {
      return { taken: session.taken };
    }

    if (field === Fields.Remaining) {
      return { remaining: session.remaining };
    }

    if (field === Fields.Graphs) {
      return { graphs: session.graphs };
    }
  }

  // async updateTaken(uuid: string) {
  //   const session = this.sessions.find((session) => session.uuid === uuid);
  //   const taken = await this.getTaken(uuid);

  //   if (typeof session !== "undefined") {
  //     session.taken = taken;

  //     this.sendUpdate(session);
  //   }
  // }

  // async updateTodo(uuid: string) {
  //   const session = this.sessions.find((session) => session.uuid === uuid);
  //   const todo = await this.getTodo(uuid);

  //   if (typeof session !== "undefined") {
  //     session.todo = todo;

  //     this.sendUpdate(session);
  //   }
  // }

  // async getTodo(uuid: string): Promise<Summary[]> {
  //   const result = await mysqlClient.execute(
  //     `SELECT HEX(player.uuid) AS uuid, player.username, SUM(entry.sips) AS sips, SUM(entry.shots) AS shots FROM entry INNER JOIN player ON (player.uuid, player.session) = (entry.player, entry.session) WHERE player.session = UNHEX(REPLACE(?, '-', '')) AND entry.giveable = 0 AND (entry.sips > 0 OR entry.shots > 0) GROUP BY entry.player`,
  //     [uuid],
  //   );
  //   return result.rows!.map((row) => {
  //     const uuid = restoreUUID(row.uuid);
  //     return { ...row, uuid };
  //   });
  // }

  async fetchTaken(uuid: string): Promise<Summary[]> {
    const result = await mysqlClient.execute(
      "SELECT HEX(`uuid`) AS `uuid`, `username`, IFNULL(-(SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.session = player.session AND entry.giveable = 0 AND entry.transfer = 0 AND entry.sips < 0), 0) AS taken_sips, IFNULL(-(SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.session = player.session AND entry.giveable = 0 AND entry.transfer = 0 AND entry.shots < 0), 0) AS taken_shots FROM player WHERE session = UNHEX(REPLACE(?, '-', ''))",
      [uuid],
    );

    return result.rows!.map((row) => {
      const uuid = restoreUUID(row.uuid);

      const taken_sips = parseInt(row.taken_sips);
      const taken_shots = parseInt(row.taken_shots);

      return { ...row, taken_sips, taken_shots, uuid };
    });
  }

  async fetchRemaining(uuid: string): Promise<Summary[]> {
    const result = await mysqlClient.execute(
      "SELECT HEX(`uuid`) AS `uuid`, `username`, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.session = player.session AND entry.giveable = 0), 0) AS remaining_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.session = player.session AND entry.giveable = 0), 0) AS remaining_shots FROM player WHERE session = UNHEX(REPLACE(?, '-', ''))",
      [uuid],
    );

    return result.rows!.map((row) => {
      const uuid = restoreUUID(row.uuid);

      const remaining_sips = parseInt(row.remaining_sips);
      const remaining_shots = parseInt(row.remaining_shots);

      return { ...row, remaining_sips, remaining_shots, uuid };
    });
  }

  async fetchGraph(uuid: string): Promise<Summary[]> {
    const result = await mysqlClient.execute(
      "SELECT TIMESTAMP(CONCAT(YEAR(entry.created), '-', MONTH(entry.created), '-' , DAYOFMONTH(entry.created), ' ', HOUR(entry.created), ':', (FLOOR(MINUTE(entry.created) / 10) * 10), ':00')) AS timestamp, HEX(player.uuid) AS uuid, player.username, -SUM(entry.sips) AS sips, -SUM(entry.shots) AS shots FROM entry INNER JOIN player ON (player.uuid, player.session) = (entry.player, entry.session) WHERE player.session = UNHEX(REPLACE(?, '-', '')) AND entry.giveable = 0 AND entry.transfer = 0 AND entry.created >= DATE_SUB(NOW(), INTERVAL 12 HOUR) AND (entry.sips < 0 OR entry.shots < 0) GROUP BY timestamp, entry.player;",
      [uuid],
    );

    return result.rows!.map((row) => {
      const uuid = restoreUUID(row.uuid);

      const sips = parseInt(row.sips);
      const shots = parseInt(row.shots);

      return { ...row, sips, shots, uuid };
    });
  }

  async updateTaken(uuid: string): Promise<void> {
    const session = this.findSession(uuid);

    if (typeof session !== "undefined") {
      const taken = await this.fetchTaken(uuid);

      session.taken = taken;

      this.updateClient(session, Fields.Taken);
    }
  }

  async updateRemaining(uuid: string): Promise<void> {
    const session = this.findSession(uuid);

    if (typeof session !== "undefined") {
      const remaining = await this.fetchRemaining(uuid);

      session.remaining = remaining;

      this.updateClient(session, Fields.Remaining);
    }
  }

  async updateGraph(uuid: string): Promise<void> {
    const session = this.findSession(uuid);

    if (typeof session !== "undefined") {
      const graphs = await this.fetchGraph(uuid);

      session.graphs = graphs;

      this.updateClient(session, Fields.Graphs);
    }
  }
}

const manager = new Manager();

export default manager;
