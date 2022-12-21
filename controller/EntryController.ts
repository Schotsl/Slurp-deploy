import { CustomError } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/errors.ts";
import { renderREST } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/helper.ts";
import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/controller/InterfaceController.ts";
import GeneralController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/controller/GeneralController.ts";
import EntryCollection from "../collection/EntryCollection.ts";
import EntryEntity from "../entity/EntryEntity.ts";

import sessionManager from "../sessionManager.ts";

export default class EntryController implements InterfaceController {
  private generalController: GeneralController;

  constructor(
    name: string,
  ) {
    this.generalController = new GeneralController(
      name,
      EntryEntity,
      EntryCollection,
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
    await this.generalController.getCollection({ response, state });
  }

  async getObject(
    { response, params, state }: {
      response: Response;
      params: { uuid: string };
      state: State;
    },
  ) {
    await this.generalController.getObject({ response, params, state });
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

    // If the player is not specified we'll assume the current player receives the entry
    if (typeof value.player === "undefined") value.player = state.player;

    value.session = state.session;

    if (
      value.shots > 0 && value.sips < 0 || value.shots < 0 && value.sips > 0
    ) {
      throw new CustomError(
        "Both 'sips' and 'shots' should either be positive or negative.",
        400,
      );
    }

    const entity = await this.generalController.addObject({
      request,
      response,
      state,
      value,
    });

    const parsed = renderREST(entity);

    sessionManager.sessionEntry(parsed);
  }
}
