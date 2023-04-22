// deno-lint-ignore-file no-explicit-any

import GeneralRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/repository/GeneralRepository.ts";

import PlayerRepository from "./repository/PlayerRepository.ts";

import SessionEntity from "./entity/SessionEntity.ts";
import SessionCollection from "./collection/SessionCollection.ts";

import { renderREST } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/helper.ts";
import { Entry, Event, Listener, Player } from "./types.ts";

class Manager {
  private listeners: Listener[] = [];

  private playerRepository: PlayerRepository;
  private sessionRepository: GeneralRepository;

  constructor() {
    this.playerRepository = new PlayerRepository("player");
    this.sessionRepository = new GeneralRepository(
      "session",
      SessionEntity,
      SessionCollection,
    );
  }

  addListener(session: string, socket: WebSocket) {
    const listener = { session, socket };

    this.listeners.push(listener);

    socket.onopen = async () => {
      const sessionObject = await this.getSession(session);
      const sessionEvent = Event.SessionServer;
      const sessionData = { event: sessionEvent, session: sessionObject };

      this.sendEvent({ session, socket }, sessionData);
    };
  }

  sessionEntry(entry: Entry) {
    this.listeners.forEach((listener) => {
      if (listener.session === entry.session) {
        const event = Event.SessionEntry;
        const data = { event, entry };

        this.sendEvent(listener, data);
      }
    });
  }

  sessionPlayer(player: Player) {
    this.listeners.forEach((listener) => {
      if (listener.session === player.session) {
        const event = Event.SessionPlayer;
        const data = { event, player };

        this.sendEvent(listener, data);
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

  private async getSession(uuid: string) {
    const sessionObject = await this.sessionRepository.getObject(uuid);
    const sessionParsed = renderREST(sessionObject);

    const playersObject = await this.playerRepository.getCollection(0, 1000, undefined, uuid);
    const playersParsed = renderREST(playersObject);

    sessionParsed.players = playersParsed.players;

    return sessionParsed;
  }
}

const manager = new Manager();

export default manager;
