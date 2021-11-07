import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { Response } from "https://deno.land/x/oak@v9.0.1/mod.ts";
import { MissingImplementation } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";

import GraphRepository from "../repository/GraphRepository.ts";
import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";

export default class GraphController implements InterfaceController {
  private graphRepository: GraphRepository;

  constructor(mysqlClient: Client) {
    this.graphRepository = new GraphRepository(mysqlClient);
  }

  async getCollection(
    { response }: {
      response: Response;
    },
  ) {
    response.body = await this.graphRepository.getCollection();
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
