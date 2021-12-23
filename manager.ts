import mysqlClient from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/connections/mysql.ts";
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
  clients: WebSocket[];

  todo: Summary[];
  taken: Summary[];
}

class Manager {
  servers: Server[] = [];

  addClient(client: WebSocket) {
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
        this.storeClient(client, server);

        // Disable the onmessage event
        client.onmessage = () => {};
        client.send(`Authorized successfully!`);
      } catch {
        client.send(`Your token is invalid.`);
        return;
      }
    };
  }

  async storeClient(client: WebSocket, uuid: string) {
    const server = this.servers.find((server) => server.uuid === uuid);

    if (typeof server !== "undefined") {
      server.clients.push(client);
      return;
    }

    // If we creating a new server
    const clients = [client];
    const taken = await this.getTaken(uuid);
    const todo = await this.getTodo(uuid);

    this.servers.push({ uuid, clients, taken, todo });
  }

  async updateTaken(uuid: string) {
    const server = this.servers.find((server) => server.uuid === uuid);
    const taken = await this.getTaken(uuid);

    if (typeof server !== "undefined") {
      server.taken = taken;

      this.sendUpdate(server);
    }
  }

  async updateTodo(uuid: string) {
    const server = this.servers.find((server) => server.uuid === uuid);
    const todo = await this.getTodo(uuid);

    if (typeof server !== "undefined") {
      server.todo = todo;

      this.sendUpdate(server);
    }
  }

  sendUpdate(server: Server) {
    const { taken, todo } = server;
    const body = JSON.stringify({ taken, todo });

    server.clients.forEach((client) => {
      client.send(body);
    });
  }

  async getTodo(uuid: string): Promise<Summary[]> {
    const result = await mysqlClient.execute(
      `SELECT HEX(player.uuid) AS uuid, player.username, SUM(entry.sips) AS sips, SUM(entry.shots) AS shots FROM entry INNER JOIN player ON (player.uuid, player.server) = (entry.player, entry.server) WHERE player.server = UNHEX(REPLACE(?, '-', '')) AND entry.giveable = 0 AND (entry.sips > 0 OR entry.shots > 0) GROUP BY entry.player`,
      [uuid],
    );
    return result.rows!.map((row) => {
      const uuid = restoreUUID(row.uuid);
      return { ...row, uuid };
    });
  }

  async getTaken(uuid: string): Promise<Summary[]> {
    const result = await mysqlClient.execute(
      `SELECT HEX(player.uuid) AS uuid, player.username, -SUM(entry.sips) AS sips, -SUM(entry.shots) AS shots FROM entry INNER JOIN player ON (player.uuid, player.server) = (entry.player, entry.server) WHERE player.server = UNHEX(REPLACE(?, '-', '')) AND entry.giveable = 0 AND entry.transfer = 0 AND (entry.sips < 0 OR entry.shots < 0) GROUP BY entry.player`,
      [uuid],
    );
    return result.rows!.map((row) => {
      const uuid = restoreUUID(row.uuid);
      return { ...row, uuid };
    });
  }
}

const manager = new Manager();

export default manager;
