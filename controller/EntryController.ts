import { CustomError } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";
import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";
import GeneralController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/GeneralController.ts";
import EntryCollection from "../collection/EntryCollection.ts";
import EntryEntity from "../entity/EntryEntity.ts";
import manager from "../manager.ts";

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
    { response, params }: {
      response: Response;
      params: { uuid: string };
    },
  ) {
    await this.generalController.getObject({ response, params });
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

    await this.generalController.addObject({ request, response, value });

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

    // if (!value.giveable && (value.shots > 0 || value.sips > 0)) {
    manager.updatePersonal(value.player);
    // }
  }
}
