import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v10.6.0/mod.ts";

import { renderREST } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";
import { CustomError } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";
import { validateUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/validation/string.ts";
import { generateColor } from "../helper.ts";

import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";
import GeneralController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/GeneralController.ts";
import PlayerRepository from "../repository/PlayerRepository.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";
import PlayerEntity from "../entity/PlayerEntity.ts";

export default class PlayerController implements InterfaceController {
  private playerRepository: PlayerRepository;
  private generalController: GeneralController;

  constructor(
    name: string,
  ) {
    this.playerRepository = new PlayerRepository(name);
    this.generalController = new GeneralController(
      name,
      PlayerEntity,
      PlayerCollection,
    );
  }

  async getCollection(
    { response, state }: {
      response: Response;
      state: State;
    },
  ) {
    const { offset, limit } = state;

    const session = state.uuid;
    const result = await this.playerRepository.getCollection(
      offset,
      limit,
      session,
    );

    const parsed = renderREST(result);

    response.body = parsed;
  }

  async updateObject(
    { request, response, params }: {
      request: Request;
      response: Response;
      params: { uuid: string };
    },
  ) {
    await this.generalController.updateObject({ request, response, params });
  }

  async getObject(
    { response, params, state }: {
      response: Response;
      params: { uuid: string };
      state: State;
    },
  ) {
    const uuid = params.uuid;
    const session = state.uuid;

    const result = await this.playerRepository.getObject(uuid, session);
    const parsed = renderREST(result);

    response.body = parsed;
  }

  async removeObject(
    { response, params }: {
      response: Response;
      params: { uuid: string };
    },
  ) {
    await this.generalController.removeObject({ response, params });
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
    const uuid = value.uuid!;

    validateUUID(uuid, "uuid");

    const endpoint = `https://api.mojang.com/user/profiles/${value.uuid}/names`;
    const results = await fetch(endpoint);

    if (results.status !== 200) {
      throw new CustomError("No Mojang profile found with this UUID.", 404);
    }

    const usernames = await results.json();
    const username = usernames[usernames.length - 1].name;

    value.username = username;
    value.session = state.uuid;
    value.color = generateColor(uuid);

    await this.generalController.addObject({ request, response, value, uuid });
  }
}
