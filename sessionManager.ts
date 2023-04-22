// deno-lint-ignore-file no-explicit-any

import PlayerRepository from "./repository/PlayerRepository.ts";
import graphManager from "./graphManager.ts";

import { renderREST } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/helper.ts";
import { Entry, Listener, Player } from "./types.ts";

class Manager {
  private graphListeners: Listener[] = [];
  private listeners: Listener[] = [];
  private repository: PlayerRepository;

  constructor() {
    this.repository = new PlayerRepository("player");
  }

  addListener(session: string, socket: WebSocket, type: "graph" | "session") {
    const listener = { session, socket };

    if (type === "graph") {
      this.graphListeners.push(listener);
    } else {
      this.listeners.push(listener);
    }

    socket.onopen = async () => {
      if (type === "graph") {
        const graphData = await graphManager.getLineChart(session);
        this.sendEvent({ session, socket }, graphData);
      } else {
        const playerArray = await this.getPlayers(session);
        this.sendEvent({ session, socket }, playerArray);
      }
    };
  }

  async sessionEntry(entry: Entry) {
    const graphData = await graphManager.getLineChart(entry.session);
    const playerData = this.getPlayers(entry.session);

    this.listeners.forEach((listener) => {
      if (listener.session === entry.session) {
        this.sendEvent(listener, playerData);
      }
    });

    this.graphListeners.forEach((listener) => {
      if (listener.session === entry.session) {
        this.sendEvent(listener, graphData);
      }
    });
  }

  sessionPlayer(player: Player) {
    const players = this.getPlayers(player.session);

    this.listeners.forEach((listener) => {
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
