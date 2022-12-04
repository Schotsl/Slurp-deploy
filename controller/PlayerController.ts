import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

import { renderREST } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.0/helper.ts";
import {
  InvalidProperty,
  MissingProperty,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.0/errors.ts";

import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.0/controller/InterfaceController.ts";
import GeneralController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.0/controller/GeneralController.ts";
import PlayerRepository from "../repository/PlayerRepository.ts";
import GeneralRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.0/repository/GeneralRepository.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";
import PlayerEntity from "../entity/PlayerEntity.ts";

import SessionEntity from "../entity/SessionEntity.ts";
import SessionCollection from "../collection/SessionCollection.ts";

import sessionManager from "../sessionManager.ts";

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
    { request, response, params, state }: {
      request: Request;
      response: Response;
      params: { uuid: string };
      state: State;
    },
  ) {
    await this.generalController.updateObject({
      request,
      response,
      params,
      state,
    });
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
    { response, params, state }: {
      response: Response;
      params: { uuid: string };
      state: State;
    },
  ) {
    await this.generalController.removeObject({ response, params, state });
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

    if (typeof value.session === "undefined") {
      throw new MissingProperty("session");
    }

    try {
      // Check if the user has provided a valid UUID
      await this.sessionRepository.getObject(value.session);
    } catch {
      try {
        // If no valid UUID has been provided we'll try too look it up by shortcode
        const session = value.session;
        const entity = await this.sessionRepository.getObjectBy(
          "shortcode",
          session,
        );

        value.session = entity.uuid.getValue();
      } catch {
        // If no valid UUID or shortcode has been provided we'll abort
        throw new InvalidProperty("session", "UUID or shortcode");
      }
    }

    const result = await this.generalController.addObject({
      request,
      response,
      value,
      state,
    });

    // We're requesting the same data again but with a custom repository
    const entity = await this.playerRepository.getObject(result.uuid);
    const parsed = renderREST(entity);

    sessionManager.sessionPlayer(parsed);
  }
}
