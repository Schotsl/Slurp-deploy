import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { validateUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/validation.ts";
import { Request, Response } from "https://deno.land/x/oak@v9.0.1/mod.ts";

import PlayerEntity from "../entity/PlayerEntity.ts";
import PlayerRepository from "../repository/PlayerRepository.ts";
import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";

export default class PlayerController implements InterfaceController {
  private playerRepository: PlayerRepository;

  constructor(mysqlClient: Client) {
    this.playerRepository = new PlayerRepository(mysqlClient);
  }

  async getCollection(
    { request, response }: { request: Request; response: Response },
  ) {
    const limit = Number(request.url.searchParams.get(`limit`));
    const offset = Number(request.url.searchParams.get(`offset`));

    response.body = await this.playerRepository.getCollection(
      offset,
      limit,
    );
  }

  async removeObject(
    { params, response }: {
      request: Request;
      params: { uuid: string };
      response: Response;
    },
  ) {
    await this.playerRepository.removeObject(params.uuid);

    response.status = 204;
  }

  async updateObject(
    { request, params, response }: {
      request: Request;
      params: { uuid: string };
      response: Response;
    },
  ) {
    const body = await request.body();
    const value = await body.value;
    delete value.uuid;

    validateUUID(value.player, "player", true);
    validateUUID(value.server, "server", true);

    const player = new PlayerEntity(params.uuid);
    Object.assign(player, value);

    response.body = await this.playerRepository.updateObject(player);
  }

  async addObject(
    { request, response }: { request: Request; response: Response },
  ) {
    const body = await request.body();
    const value = await body.value;
    delete value.uuid;

    validateUUID(value.player, "player");
    validateUUID(value.server, "server");

    const player = new PlayerEntity();
    Object.assign(player, value);

    response.body = await this.playerRepository.addObject(player);
  }
}
