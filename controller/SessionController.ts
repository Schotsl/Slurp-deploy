import { renderREST } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/helper.ts";
import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/controller/InterfaceController.ts";
import GeneralController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/controller/GeneralController.ts";
import SessionCollection from "../collection/SessionCollection.ts";
import SessionEntity from "../entity/SessionEntity.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";
import PlayerRepository from "../repository/PlayerRepository.ts";
import { createToken } from "../middleware.ts";

export default class SessionController implements InterfaceController {
  private generalController: GeneralController;
  private secondController: GeneralController;
  private playerRepository: PlayerRepository;

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
      }
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
    const shortcodes = [
      "vodka",
      "smirnoff",
      "rum",
      "whiskey",
      "absolut",
      "fireball",
      "bourbon",
      "tequila",
      "jagermeister",
    ];
    const shortcode = shortcodes[Math.floor(Math.random() * shortcodes.length)];

    const body = await request.body();
    const value = await body.value;

    value.shortcode = shortcode;

    const entity = await this.secondController.addObject({
      request,
      response,
      state,
      value,
    });

    const result = renderREST(entity);

    result.token = await createToken(entity.uuid);

    response.body = result;
  }
}
