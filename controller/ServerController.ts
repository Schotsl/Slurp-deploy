import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { createToken } from "../middleware.ts";
import { Request, Response } from "https://deno.land/x/oak@v9.0.1/mod.ts";

import ServerEntity from "../entity/ServerEntity.ts";
import ServerRepository from "../repository/ServerRepository.ts";
import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";

export default class ServerController implements InterfaceController {
  private serverRepository: ServerRepository;

  constructor(mysqlClient: Client) {
    this.serverRepository = new ServerRepository(mysqlClient);
  }

  async getCollection(
    { response, request }: {
      response: Response;
      request: Request;
    },
  ) {
    const limit = Number(request.url.searchParams.get(`limit`));
    const offset = Number(request.url.searchParams.get(`offset`));

    response.body = await this.serverRepository.getCollection(
      offset,
      limit,
    );
  }

  async removeObject(
    { response, params }: {
      response: Response;
      request: Request;
      params: { uuid: string };
    },
  ) {
    await this.serverRepository.removeObject(params.uuid);

    response.status = 204;
  }

  async updateObject(
    { response, request, params }: {
      response: Response;
      request: Request;
      params: { uuid: string };
    },
  ) {
    const body = await request.body();
    const value = await body.value;

    delete value.uuid;

    // TODO: Prevent non existing properties from being copied

    const server = new ServerEntity(params.uuid);
    Object.assign(server, value);

    response.body = await this.serverRepository.updateObject(server);
  }

  async addObject(
    { response, request }: {
      response: Response;
      request: Request;
    },
  ) {
    const body = await request.body();
    const value = await body.value;

    delete value.uuid;

    const server = new ServerEntity();
    Object.assign(server, value);

    const fetched = await this.serverRepository.addObject(server);
    fetched.token = await createToken(fetched.uuid);
    response.body = fetched;
  }
}
