export interface Consumable {
  sips: number;
  shots: number;
}

export interface Listener {
  session: string;
  socket: WebSocket;
}

export interface Entry {
  uuid: string;

  sips: number;
  shots: number;
  player: string;
  session: string;
  givable: boolean;
  transfer: boolean;

  updated: Date;
  created: Date;
}

export interface Player {
  uuid: string;

  session: string;
  username: string;

  updated: Date;
  created: Date;
}

export enum Event {
  SessionEntry = 0,
  SessionPlayer = 1,
}
