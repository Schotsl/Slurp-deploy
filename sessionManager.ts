import { Entry, Event, Listener, Player } from "./types.ts";

class Manager {
  private listeners: Listener[] = [];

  addListener(session: string, socket: WebSocket) {
    this.listeners.push({ session, socket });
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
}

const manager = new Manager();

export default manager;
