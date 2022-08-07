export interface Consumable {
  sips: number;
  shots: number;
}

export interface Listener {
  uuid: string;
  client: WebSocket;
}
