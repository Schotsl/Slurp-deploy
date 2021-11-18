import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { validateUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/validation.ts";
import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v9.0.1/mod.ts";

import PlayerEntity from "../entity/PlayerEntity.ts";
import PlayerRepository from "../repository/PlayerRepository.ts";
import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";

export default class PlayerController implements InterfaceController {
  private playerRepository: PlayerRepository;

  constructor(mysqlClient: Client) {
    this.playerRepository = new PlayerRepository(mysqlClient);
  }

  async getCollection(
    { response, state }: {
      response: Response;
      request: Request;
      state: State;
    },
  ) {
    const offset = state.offset;
    const server = state.uuid;
    const limit = state.limit;

    response.body = await this.playerRepository.getCollection(
      offset,
      limit,
      server,
    );
  }

  async removeObject(
    { response, params, state }: {
      response: Response;
      request: Request;
      params: { uuid: string };
      state: State;
    },
  ) {
    await this.playerRepository.removeObject(params.uuid, state.uuid);

    response.status = 204;
  }

  async updateObject(
    { response, request, params, state }: {
      response: Response;
      request: Request;
      params: { uuid: string };
      state: State;
    },
  ) {
    const body = await request.body();
    const value = await body.value;

    value.server = state.uuid;

    const player = new PlayerEntity(params.uuid);
    Object.assign(player, value);

    response.body = await this.playerRepository.updateObject(player);
  }

  async addObject(
    { response, request, state }: {
      response: Response;
      request: Request;
      state: State;
    },
  ) {
    const body = await request.body();
    const value = await body.value;

    value.server = state.uuid;

    validateUUID(value.uuid, "uuid");

    const player = new PlayerEntity();
    Object.assign(player, value);

    response.body = await this.playerRepository.addObject(player);
  }
}
