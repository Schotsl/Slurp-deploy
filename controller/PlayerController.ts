import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { ColumnInfo } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/types.ts";
import { CustomError } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";
import { validateUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/validation/string.ts";
import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v10.1.0/mod.ts";
import {
  generateColumns,
  populateInstance,
  renderREST,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";

import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";
import PlayerRepository from "../repository/PlayerRepository.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";
import PlayerEntity from "../entity/PlayerEntity.ts";

export default class GeneralController implements InterfaceController {
  private generalColumns: ColumnInfo[] = [];
  private generalRepository: PlayerRepository;

  constructor(mysqlClient: Client, name: string) {
    this.generalColumns = generateColumns(PlayerEntity);
    this.generalRepository = new PlayerRepository(
      mysqlClient,
      name,
      PlayerEntity,
      PlayerCollection,
    );
  }

  async getObject(
    { params, response }: {
      request: Request;
      params: { uuid: string };
      response: Response;
    },
  ) {
    const uuid = params.uuid;
    const result = await this.generalRepository.getObject(uuid);
    const parsed = renderREST(result);

    response.body = parsed;
  }

  async getCollection(
    { response, state }: {
      response: Response;
      state: State;
    },
  ) {
    const { offset, limit } = state;

    const result = await this.generalRepository.getCollection(offset, limit);
    const parsed = renderREST(result);

    response.body = parsed;
  }

  async removeObject(
    { params, response }: {
      request: Request;
      params: { uuid: string };
      response: Response;
    },
  ) {
    const uuid = params.uuid;
    await this.generalRepository.removeObject(uuid);

    response.status = 204;
  }

  async addObject(
    { request, response, state }: {
      request: Request;
      response: Response;
      state: State;
    },
  ) {
    const body = await request.body();
    const value = await body.value;
    const object = new PlayerEntity();

    validateUUID(value.uuid, "uuid");

    const endpoint = `https://api.mojang.com/user/profiles/${value.uuid}/names`;
    const reaction = await fetch(endpoint);

    if (reaction.status !== 200) {
      throw new CustomError("No Mojang profile found with this UUID.", 404);
    }

    const usernames = await reaction.json();
    const username = usernames[usernames.length - 1].name;

    value.username = username;
    value.server = state.uuid;

    populateInstance(value, this.generalColumns, object);

    const result = await this.generalRepository.addObject(object);
    const parsed = renderREST(result);

    response.body = parsed;
  }
}
