import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v10.6.0/mod.ts";

import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";
import GeneralController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/GeneralController.ts";
import SessionCollection from "../collection/SessionCollection.ts";
import SessionEntity from "../entity/SessionEntity.ts";

export default class SessionController implements InterfaceController {
  private generalController: GeneralController;

  constructor(
    name: string,
  ) {
    this.generalController = new GeneralController(
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
    await this.generalController.getObject({ response, params });
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
    { request, response }: { request: Request; response: Response },
  ) {
    const shorts = ["vodka", "smirnoff", "rum", "whiskey", "absolut", "fireball", "bourbon", "tequila", "jagermeister"];
    const short = shorts[Math.floor(Math.random() * shorts.length)];

    const body = await request.body();
    const value = await body.value;

    value.short = short;
    response.body = await this.generalController.addObject({
      request,
      response,
      value,
    });
  }
}
