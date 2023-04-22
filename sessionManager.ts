// deno-lint-ignore-file no-explicit-any

import PlayerRepository from "./repository/PlayerRepository.ts";

import { renderREST } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/helper.ts";
import { Entry, Event, Listener, Player } from "./types.ts";

class Manager {
  private listeners: Listener[] = [];
  private repository: PlayerRepository;

  constructor() {
    this.repository = new PlayerRepository("player");
  }

  addListener(session: string, socket: WebSocket) {
    const listener = { session, socket };

    this.listeners.push(listener);

    socket.onopen = async () => {
      const sessionObject = await this.getPlayers(session);
      const sessionEvent = Event.SessionServer;
      const sessionData = { event: sessionEvent, session: sessionObject };

      this.sendEvent({ session, socket }, sessionData);
    };
  }

  sessionEntry(entry: Entry) {
    const players = this.getPlayers(entry.session);

    this.listeners.forEach((listener) => {
      if (listener.session === entry.session) {
        this.sendEvent(listener, players);
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
    const collectionObject = await this.repository.getCollection(0, 1000, undefined, uuid);
    const collectionParsed = renderREST(collectionObject);

    return collectionParsed.players;
  }
}

const manager = new Manager();

export default manager;
