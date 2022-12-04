import { CustomError } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.0/errors.ts";
import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.0/controller/InterfaceController.ts";
import GeneralController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.0/controller/GeneralController.ts";
import EntryCollection from "../collection/EntryCollection.ts";
import EntryEntity from "../entity/EntryEntity.ts";

import managerPersonal from "../managerPersonal.ts";

export default class EntryController implements InterfaceController {
  private generalController: GeneralController;

  constructor(
    name: string,
  ) {
    this.generalController = new GeneralController(
      name,
      EntryEntity,
      EntryCollection,
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

    await this.generalController.addObject({ request, response, state, value });

    if (
      value.shots > 0 && value.sips < 0 || value.shots < 0 && value.sips > 0
    ) {
      throw new CustomError(
        "Both 'sips' and 'shots' should either be positive or negative.",
        400,
      );
    }

    // if (!value.giveable && (value.shots < 0 || value.sips < 0)) {
    //   manager.updateTaken(session);
    //   manager.updateGraph(session);
    //   manager.updateRemaining(session);
    // }

    // if (
    // !value.giveable && !value.transfer && (value.shots < 0 || value.sips < 0)
    // ) {
    // manager.updateGraph(value.player);
    // }

    // if (!value.giveable && (value.shots > 0 || value.sips > 0)) {
    managerPersonal.updateStorage(value.player);
    // }
  }
}
