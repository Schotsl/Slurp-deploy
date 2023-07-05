import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v12.2.0/mod.ts";

import { createToken } from "../middleware.ts";
import { renderREST } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/helper.ts";
import {
  InvalidProperty,
  MissingProperty,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/errors.ts";

import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/controller/InterfaceController.ts";
import GeneralController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/controller/GeneralController.ts";
import PlayerRepository from "../repository/PlayerRepository.ts";
import GeneralRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/repository/GeneralRepository.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";
import PlayerEntity from "../entity/PlayerEntity.ts";

import SessionEntity from "../entity/SessionEntity.ts";
import SessionCollection from "../collection/SessionCollection.ts";

export default class PlayerController implements InterfaceController {
  private playerRepository: PlayerRepository;
  private sessionRepository: GeneralRepository;

  private secondController: GeneralController;
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

    this.secondController = new GeneralController(
      name,
      PlayerEntity,
      PlayerCollection,
    );

    this.generalController = new GeneralController(
      name,
      PlayerEntity,
      PlayerCollection,
      {
        key: "session",
        type: "uuidv4",
        value: "session",
      },
    );
  }

  async getCollection(
    { response, state }: {
      response: Response;
      state: State;
    },
  ) {
    const { offset, limit, session } = state;

    const result = await this.playerRepository.getCollection(
      offset,
      limit,
      undefined,
      session,
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
    { response, params, state }: {
      response: Response;
      params: { uuid: string };
      state: State;
    },
  ) {
    const uuid = params.uuid ? params.uuid : state.player;
    const session = state.session;
    const result = await this.playerRepository.getObject(
      uuid,
      undefined,
      session,
    );

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
        // If no valid UUID or shortcode has been provided we'll abort\
        throw new InvalidProperty("session", "UUID or shortcode");
      }
    }

    const result = await this.secondController.addObject({
      request,
      response,
      value,
      state,
    });

    // We're requesting the same data again but with a custom repository
    result.token = await createToken(result.session, result.uuid);

    response.body = result;
  }
}
