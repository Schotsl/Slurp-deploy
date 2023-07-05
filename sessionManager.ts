// deno-lint-ignore-file no-explicit-any

import PlayerRepository from "./repository/PlayerRepository.ts";
import graphManager from "./graphManager.ts";

import { Listener } from "./types.ts";
import { renderREST } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/helper.ts";

class Manager {
  private barsListeners: Listener[] = [];
  private graphListeners: Listener[] = [];
  private sessionListeners: Listener[] = [];

  private sessions: string[] = [];
  private repository: PlayerRepository;

  private lastBars: any = {};
  private lastGraph: any = {};
  private lastPlayers: any = {};

  constructor() {
    this.repository = new PlayerRepository("player");

    setInterval(() => this.updateListeners(), 1000);
  }

  async addListener(
    session: string,
    socket: WebSocket,
    type: "graph" | "session" | "bars",
  ) {
    const listener = { session, socket };

    let data: any;

    this.sessions.push(session);

    switch (type) {
      case "graph":
        data = await graphManager.getLineChart(session);
        this.lastGraph[session] = data;
        this.graphListeners.push(listener);
        break;
      case "bars":
        data = await graphManager.getBarChart(session);
        this.lastBars[session] = data;
        this.barsListeners.push(listener);
        break;
      case "session":
        data = await this.getPlayers(session);
        this.lastPlayers[session] = data;
        this.sessionListeners.push(listener);
        break;
    }

    this.sendEvent({ session, socket }, data);
  }

  async updateListeners() {
    this.sessions.forEach(async (session) => {
      const newBarsData = await graphManager.getBarChart(session);
      const newGraphData = await graphManager.getLineChart(session);
      const newPlayersData = await this.getPlayers(session);

      if (JSON.stringify(this.lastGraph[session]) !== JSON.stringify(newGraphData)) {
        this.lastGraph[session] = newGraphData;

        this.graphListeners.forEach((listener) => {
          if (listener.session === session) {
            this.sendEvent(listener, newGraphData);
          }
        });
      }

      if (JSON.stringify(this.lastBars[session]) !== JSON.stringify(newBarsData)) {
        this.lastBars[session] = newBarsData;

        this.barsListeners.forEach((listener) => {
          if (listener.session === session) {
            this.sendEvent(listener, newBarsData);
          }
        });
      }

      if (JSON.stringify(this.lastPlayers[session]) !== JSON.stringify(newPlayersData)) {
        this.lastPlayers[session] = newPlayersData;

        this.sessionListeners.forEach((listener) => {
          if (listener.session === session) {
            this.sendEvent(listener, newPlayersData);
          }
        });
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
