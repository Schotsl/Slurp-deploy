import mysqlClient from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/services/mysqlClient.ts";

import { verifyToken } from "./middleware.ts";
import { restoreUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";

interface Summary {
  uuid: string;
  sips: string;
  shots: string;
  username: string;
}

interface Server {
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
  servers: Server[] = [];

  authenticateClient(client: WebSocket) {
    client.onopen = () => {
      client.send(`Please provide your Authentication header.`);
    };

    client.onmessage = async (message) => {
      const header = message.data;
      const regexp = new RegExp(/^Bearer (.*)$/);
      const result = regexp.test(header);

      if (!result) {
        client.send(`Your Authentication header is improperly formatted.`);
        return;
      }

      const token = header.split(" ")[1];

      try {
        const payload = await verifyToken(token);
        const server = payload.uuid as string;

        // Store the client for future server updates
        this.storeClient(server, client);

        // Disable the onmessage event
        client.onmessage = () => {};
        client.send(`Authorized successfully!`);
      } catch {
        client.send(`Your token is invalid.`);
        return;
      }
    };
  }

  findServer(uuid: string) {
    return this.servers.find((server) => server.uuid === uuid);
  }

  async storeClient(uuid: string, client: WebSocket) {
    const server = this.servers.find((server) => server.uuid === uuid);

    if (typeof server !== "undefined") {
      server.clients.push(client);
      this.updateClient(server, Fields.All, client);
      return;
    }

    // If we creating a new server
    const clients = [client];
    const taken = await this.fetchTaken(uuid);
    const graphs = await this.fetchGraph(uuid);
    const remaining = await this.fetchRemaining(uuid);
    const object = { uuid, clients, taken, graphs, remaining };

    this.servers.push(object);
    this.updateClient(object, Fields.All, client);
  }

  updateClient(server: Server, field: Fields, client?: WebSocket) {
    const data = field === Fields.All
      ? this.fetchAll(server)
      : this.fetchField(server, field);
    const body = JSON.stringify(data);

    if (typeof client !== "undefined") {
      client.send(body);
      return;
    }

    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(body);
      }
    });
  }

  fetchAll(server: Server) {
    return {
      taken: server.taken,
      graphs: server.graphs,
      remaining: server.remaining,
    };
  }

  fetchField(server: Server, field: Fields) {
    if (field === Fields.Taken) {
      return { taken: server.taken };
    }

    if (field === Fields.Remaining) {
      return { remaining: server.remaining };
    }

    if (field === Fields.Graphs) {
      return { graphs: server.graphs };
    }
  }

  // async updateTaken(uuid: string) {
  //   const server = this.servers.find((server) => server.uuid === uuid);
  //   const taken = await this.getTaken(uuid);

  //   if (typeof server !== "undefined") {
  //     server.taken = taken;

  //     this.sendUpdate(server);
  //   }
  // }

  // async updateTodo(uuid: string) {
  //   const server = this.servers.find((server) => server.uuid === uuid);
  //   const todo = await this.getTodo(uuid);

  //   if (typeof server !== "undefined") {
  //     server.todo = todo;

  //     this.sendUpdate(server);
  //   }
  // }

  // async getTodo(uuid: string): Promise<Summary[]> {
  //   const result = await mysqlClient.execute(
  //     `SELECT HEX(player.uuid) AS uuid, player.username, SUM(entry.sips) AS sips, SUM(entry.shots) AS shots FROM entry INNER JOIN player ON (player.uuid, player.server) = (entry.player, entry.server) WHERE player.server = UNHEX(REPLACE(?, '-', '')) AND entry.giveable = 0 AND (entry.sips > 0 OR entry.shots > 0) GROUP BY entry.player`,
  //     [uuid],
  //   );
  //   return result.rows!.map((row) => {
  //     const uuid = restoreUUID(row.uuid);
  //     return { ...row, uuid };
  //   });
  // }

  async fetchTaken(uuid: string): Promise<Summary[]> {
    const result = await mysqlClient.execute(
      "SELECT HEX(`uuid`) AS `uuid`, `username`, IFNULL(-(SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0 AND entry.transfer = 0 AND entry.sips < 0), 0) AS taken_sips, IFNULL(-(SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0 AND entry.transfer = 0 AND entry.shots < 0), 0) AS taken_shots FROM player WHERE server = UNHEX(REPLACE(?, '-', ''))",
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
      "SELECT HEX(`uuid`) AS `uuid`, `username`, IFNULL((SELECT SUM(sips) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0), 0) AS remaining_sips, IFNULL((SELECT SUM(shots) FROM entry WHERE entry.player = player.uuid AND entry.server = player.server AND entry.giveable = 0), 0) AS remaining_shots FROM player WHERE server = UNHEX(REPLACE(?, '-', ''))",
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
      "SELECT TIMESTAMP(CONCAT(YEAR(entry.created), '-', MONTH(entry.created), '-' , DAYOFMONTH(entry.created), ' ', HOUR(entry.created), ':', (FLOOR(MINUTE(entry.created) / 10) * 10), ':00')) AS timestamp, HEX(player.uuid) AS uuid, player.username, -SUM(entry.sips) AS sips, -SUM(entry.shots) AS shots FROM entry INNER JOIN player ON (player.uuid, player.server) = (entry.player, entry.server) WHERE player.server = UNHEX(REPLACE(?, '-', '')) AND entry.giveable = 0 AND entry.transfer = 0 AND entry.created >= DATE_SUB(NOW(), INTERVAL 12 HOUR) AND (entry.sips < 0 OR entry.shots < 0) GROUP BY timestamp, entry.player;",
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
    const server = this.findServer(uuid);

    if (typeof server !== "undefined") {
      const taken = await this.fetchTaken(uuid);

      server.taken = taken;

      this.updateClient(server, Fields.Taken);
    }
  }

  async updateRemaining(uuid: string): Promise<void> {
    const server = this.findServer(uuid);

    if (typeof server !== "undefined") {
      const remaining = await this.fetchRemaining(uuid);

      server.remaining = remaining;

      this.updateClient(server, Fields.Remaining);
    }
  }

  async updateGraph(uuid: string): Promise<void> {
    const server = this.findServer(uuid);

    if (typeof server !== "undefined") {
      const graphs = await this.fetchGraph(uuid);

      server.graphs = graphs;

      this.updateClient(server, Fields.Graphs);
    }
  }
}

const manager = new Manager();

export default manager;
