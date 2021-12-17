import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { ColumnInfo } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/types.ts";
import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v10.0.0/mod.ts";
import {
  generateColumns,
  populateInstance,
  renderREST,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";

import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";
import GeneralRepository from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/repository/GeneralRepository.ts";
import EntryCollection from "../collection/EntryCollection.ts";
import EntryEntity from "../entity/EntryEntity.ts";

export default class GeneralController implements InterfaceController {
  private generalColumns: ColumnInfo[] = [];
  private generalRepository: GeneralRepository;

  constructor(mysqlClient: Client, name: string) {
    this.generalColumns = generateColumns(EntryEntity);
    this.generalRepository = new GeneralRepository(
      mysqlClient,
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
    { request, response, state }: {
      request: Request;
      response: Response;
      state: State;
    },
  ) {
    const body = await request.body();
    const value = await body.value;
    const object = new EntryEntity();
    delete value.uuid;

    value.server = state.uuid;

    populateInstance(value, this.generalColumns, object);

    const result = await this.generalRepository.addObject(object);
    const parsed = renderREST(result);

    response.body = parsed;
  }
}
