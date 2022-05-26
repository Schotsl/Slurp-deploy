import { createToken } from "../middleware.ts";
import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v10.6.0/mod.ts";

import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";
import GeneralController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/GeneralController.ts";
import ServerCollection from "../collection/ServerCollection.ts";
import ServerEntity from "../entity/ServerEntity.ts";

export default class ServerController implements InterfaceController {
  private generalController: GeneralController;

  constructor(
    name: string,
  ) {
    this.generalController = new GeneralController(
      name,
      ServerEntity,
      ServerCollection,
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
    const body = await request.body();
    const value = await body.value;
    console.log(typeof value);
    const server = await this.generalController.addObject({
      request,
      response,
      value,
    });
    const uuid = server.uuid;
    const token = await createToken(uuid);

    response.body = { ...server, token };
  }
}
