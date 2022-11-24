import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

import { renderREST } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.4/helper.ts";
import {
  InvalidProperty,
  MissingProperty,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.4/errors.ts";

import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.4/controller/InterfaceController.ts";
import GeneralController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.4/controller/GeneralController.ts";
import PlayerRepository from "../repository/PlayerRepository.ts";
import GeneralRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.4/repository/GeneralRepository.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";
import PlayerEntity from "../entity/PlayerEntity.ts";

import SessionEntity from "../entity/SessionEntity.ts";
import SessionCollection from "../collection/SessionCollection.ts";

export default class PlayerController implements InterfaceController {
  private playerRepository: PlayerRepository;
  private sessionRepository: GeneralRepository;
  private generalController: GeneralController;

  constructor(
    name: string,
  ) {
    this.playerRepository = new PlayerRepository(name);
    this.sessionRepository = new GeneralRepository(
      "session",
      SessionEntity,
      SessionCollection,
    );
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

    const result = await this.playerRepository.getCollection(
      offset,
      limit,
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
    { response, params }: {
      response: Response;
      params: { uuid: string };
    },
  ) {
    const uuid = params.uuid;
    const result = await this.playerRepository.getObject(uuid);
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
    { request, response }: {
      request: Request;
      response: Response;
    },
  ) {
    const body = await request.body();
    const value = await body.value;

    if (typeof value.session === "undefined") {
      throw new MissingProperty("session");
    }

    try {
      // Check if the user has provided a valid UUID
      await this.sessionRepository.getObject(value.session);
    } catch {
      try {
        // If no valid UUID has been provided we'll try too look it up by short
        const session = value.session;
        const entity = await this.sessionRepository.getObjectBy(
          "short",
          session,
        );

        value.session = entity.uuid.getValue();
      } catch {
        // If no valid UUID or short has been provided we'll abort
        throw new InvalidProperty("session", "UUID or short");
      }
    }

    await this.generalController.addObject({ request, response, value });
  }
}
