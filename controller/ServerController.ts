import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { ColumnInfo } from "../../Uberdeno/types.ts";
import { createToken } from "../middleware.ts";
import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v10.0.0/mod.ts";
import {
  generateColumns,
  populateInstance,
  renderREST,
} from "../../Uberdeno/helper.ts";

import InterfaceController from "../../Uberdeno/controller/InterfaceController.ts";
import GeneralRepository from "../../Uberdeno/repository/GeneralRepository.ts";
import ServerCollection from "../collection/ServerCollection.ts";
import ServerEntity from "../entity/ServerEntity.ts";

export default class GeneralController implements InterfaceController {
  private generalColumns: ColumnInfo[] = [];
  private generalRepository: GeneralRepository;

  constructor(mysqlClient: Client, name: string) {
    this.generalColumns = generateColumns(ServerEntity);
    this.generalRepository = new GeneralRepository(
      mysqlClient,
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
    const { offset, limit } = state;

    const result = await this.generalRepository.getCollection(offset, limit);
    const parsed = renderREST(result);

    response.body = parsed;
  }

  async removeObject(
    { params, response }: {
      request: Request;
      params: { uuid: string };
      response: Response;
    },
  ) {
    const uuid = params.uuid;
    await this.generalRepository.removeObject(uuid);

    response.status = 204;
  }

  async addObject(
    { request, response }: { request: Request; response: Response },
  ) {
    const body = await request.body();
    const value = await body.value;
    const object = new ServerEntity();
    delete value.uuid;

    populateInstance(value, this.generalColumns, object);

    const result = await this.generalRepository.addObject(object);
    const token = await createToken(result.uuid.getValue()!);
    const parsed = renderREST({ ...result, token });

    response.body = parsed;
  }
}
