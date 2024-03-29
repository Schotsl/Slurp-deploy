import { generateShortcode } from "../helper.ts";
import { renderREST } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/helper.ts";
import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v12.2.0/mod.ts";
import { createToken } from "../middleware.ts";

import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/controller/InterfaceController.ts";
import GeneralController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/controller/GeneralController.ts";
import SessionCollection from "../collection/SessionCollection.ts";
import SessionEntity from "../entity/SessionEntity.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";
import PlayerRepository from "../repository/PlayerRepository.ts";
import GeneralRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/repository/GeneralRepository.ts";

export default class SessionController implements InterfaceController {
  private generalController: GeneralController;
  private secondController: GeneralController;
  private playerRepository: PlayerRepository;
  private sessionRepository: GeneralRepository;

  constructor(
    name: string,
  ) {
    this.playerRepository = new PlayerRepository("player");

    this.secondController = new GeneralController(
      name,
      SessionEntity,
      SessionCollection,
    );

    this.generalController = new GeneralController(
      name,
      SessionEntity,
      SessionCollection,
      {
        key: "uuid",
        type: "uuidv4",
        value: "session",
      },
    );

    this.sessionRepository = new GeneralRepository(
      name,
      SessionEntity,
      SessionCollection,
    );
  }

  async getCollection(
    { response, state }: {
      response: Response;
      state: State;
    },
  ) {
    await this.generalController.getCollection({ response, state });
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
    const session = await this.generalController.getObject({
      response,
      params,
      state,
    });

    const players = await this.playerRepository.getCollection(
      0,
      1000,
      undefined,
      params.uuid,
    ) as PlayerCollection;

    session.players = players.players;
    response.body = renderREST(session);
  }

  async getObjectByShortcode(
    { response, params, state }: {
      response: Response;
      params: { shortcode: string };
      state: State;
    },
  ) {
    const session = await this.sessionRepository.getObjectBy("shortcode", params.shortcode) as any;
    const players = await this.playerRepository.getCollection(
      0,
      1000,
      undefined,
      session.uuid.getValue(),
    ) as PlayerCollection;

    session.players = players.players;
    response.body = renderREST(session);
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

    let success = false;
    let entity;

    while (!success) {
      try {
        value.shortcode = generateShortcode();

        entity = await this.secondController.addObject({
          request,
          response,
          state,
          value,
        });

        success = true;
      } catch {
        success = false;
      }
    }

    const result = renderREST(entity);

    result.token = await createToken(entity.uuid);

    response.body = result;
  }
}
