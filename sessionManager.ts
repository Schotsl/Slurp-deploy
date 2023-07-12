// deno-lint-ignore-file no-explicit-any

import PlayerRepository from "./repository/PlayerRepository.ts";
import graphManager from "./graphManager.ts";

import { Listener } from "./types.ts";
import { renderREST } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/helper.ts";

class Manager {
  private barsListeners: Listener[] = [];
  private graphListeners: Listener[] = [];
  private sessionListeners: Listener[] = [];

  private sessions: Set<string> = new Set();
  private repository: PlayerRepository;

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
    this.sessions.add(session);
    
    let data: any;
    switch (type) {
      case "graph":
        data = await this.addDataListener(
          listener,
          this.graphListeners,
          graphManager.getLineChart.bind(this)
        );
        break;
      case "bars":
        data = await this.addDataListener(
          listener,
          this.barsListeners,
          graphManager.getBarChart.bind(this),
        );
        break;
      case "session":
        data = await this.addDataListener(
          listener,
          this.sessionListeners,
          this.getPlayers.bind(this),
        );
        break;
    }

    this.sendEvent(listener, data);
  }

  private async addDataListener(
    listener: Listener,
    listenersArray: Listener[],
    dataRetriever: (session: string) => Promise<any>,
  ) {
    const data = await dataRetriever(listener.session);

    listenersArray.push(listener);

    return data;
  }

  async updateListeners() {
    for (const session of this.sessions) {
      await this.updateListener(
        session,
        graphManager.getLineChart.bind(this),
        this.graphListeners,
      );
      await this.updateListener(
        session,
        graphManager.getBarChart.bind(this),
        this.barsListeners,
      );
      await this.updateListener(
        session,
        this.getPlayers.bind(this),
        this.sessionListeners,
      );
    }
  }

  private async updateListener(
    session: string,
    dataRetriever: (session: string) => Promise<any>,
    listenersArray: Listener[],
  ) {
    const newData = await dataRetriever(session);

    listenersArray.forEach((listener) => {
      if (listener.session === session) {
        this.sendEvent(listener, newData);
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
