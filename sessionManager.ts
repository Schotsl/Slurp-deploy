// deno-lint-ignore-file no-explicit-any

import PlayerRepository from "./repository/PlayerRepository.ts";
import graphManager from "./graphManager.ts";

import { renderREST } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/helper.ts";
import { Entry, Listener, Player } from "./types.ts";

class Manager {
  private sessionListeners: Listener[] = [];
  private graphListeners: Listener[] = [];
  private barsListeners: Listener[] = [];
  
  private repository: PlayerRepository;

  constructor() {
    this.repository = new PlayerRepository("player");
  }

  async addListener(session: string, socket: WebSocket, type: "graph" | "session" | "bars") {
    const listener = { session, socket };

    let data: any;

    switch(type) {
      case "graph":
        data = await graphManager.getLineChart(session);
        this.graphListeners.push(listener);
        break;
      case "bars":
        data = await graphManager.getBarChart(session);
        this.barsListeners.push(listener);
        break;
      case "session":
        data = await this.getPlayers(session);
        this.sessionListeners.push(listener);
        break;
    }

    this.sendEvent({ session, socket }, data);
  }

  async sessionEntry(entry: Entry) {
    const graphData = await graphManager.getLineChart(entry.session);
    const barsData = await graphManager.getBarChart(entry.session);
    const playerData = await this.getPlayers(entry.session);

    this.sessionListeners.forEach((listener) => {
      if (listener.session === entry.session) {
        this.sendEvent(listener, playerData);
      }
    });

    this.barsListeners.forEach((listener) => {
      if (listener.session === entry.session) {
        this.sendEvent(listener, barsData);
      }
    });

    this.graphListeners.forEach((listener) => {
      if (listener.session === entry.session) {
        this.sendEvent(listener, graphData);
      }
    });
  }

  async sessionPlayer(player: Player) {
    const players = await this.getPlayers(player.session);

    this.sessionListeners.forEach((listener) => {
      if (listener.session === player.session) {
        this.sendEvent(listener, players);
      }
    });
  }

  private sendEvent(listener: Listener, data: any) {
    const socket = listener.socket;
    const message = JSON.stringify(data);

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  }

  private async getPlayers(uuid: string) {
    const collectionObject = await this.repository.getCollection(
      0,
      1000,
      undefined,
      uuid,
    );
    const collectionParsed = renderREST(collectionObject);
    return collectionParsed.players;
  }
}

const manager = new Manager();

export default manager;
