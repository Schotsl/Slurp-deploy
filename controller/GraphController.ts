import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { validateUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/validation.ts";
import { MissingImplementation } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";
import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v9.0.1/mod.ts";

import GraphRepository from "../repository/GraphRepository.ts";
import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";

export default class GraphController implements InterfaceController {
  private graphRepository: GraphRepository;

  constructor(mysqlClient: Client) {
    this.graphRepository = new GraphRepository(mysqlClient);
  }

  async getCollection(
    { response, request, state }: {
      response: Response;
      request: Request;
      state: State;
    },
  ) {
    const server = request.url.searchParams.get(`server`);
    const offset = state.offset;
    const limit = state.limit;

    validateUUID(server, "server");

    response.body = await this.graphRepository.getCollection(
      offset,
      limit,
      server!,
    );
  }

  removeObject() {
    throw new MissingImplementation();
  }

  updateObject() {
    throw new MissingImplementation();
  }

  addObject() {
    throw new MissingImplementation();
  }
}
