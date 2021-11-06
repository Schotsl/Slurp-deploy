import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { validateNumber, validateUUID } from "../../Uberdeno/validation.ts";
import { Request, Response } from "https://deno.land/x/oak@v9.0.1/mod.ts";

import EntryEntity from "../entity/EntryEntity.ts";
import EntryRepository from "../repository/EntryRepository.ts";
import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";

export default class EntryController implements InterfaceController {
  private entryRepository: EntryRepository;

  constructor(mysqlClient: Client) {
    this.entryRepository = new EntryRepository(mysqlClient);
  }

  async getCollection(
    { request, response }: { request: Request; response: Response },
  ) {
    const limit = Number(request.url.searchParams.get(`limit`));
    const offset = Number(request.url.searchParams.get(`offset`));

    response.body = await this.entryRepository.getCollection(
      offset,
      limit,
    );
  }

  async removeObject(
    { params, response }: {
      request: Request;
      params: { uuid: string };
      response: Response;
    },
  ) {
    await this.entryRepository.removeObject(params.uuid);

    response.status = 204;
  }

  async updateObject(
    { request, params, response }: {
      request: Request;
      params: { uuid: string };
      response: Response;
    },
  ) {
    const body = await request.body();
    const value = await body.value;
    delete value.uuid;

    validateUUID(value.player, "player", true);

    validateNumber(value.sips, "sips", true);
    validateNumber(value.shots, "shots", true);

    const entry = new EntryEntity(params.uuid);
    Object.assign(entry, value);

    response.body = await this.entryRepository.updateObject(entry);
  }

  async addObject(
    { request, response }: { request: Request; response: Response },
  ) {
    const body = await request.body();
    const value = await body.value;
    delete value.uuid;

    validateUUID(value.player, "player");

    validateNumber(value.sips, "sips", true);
    validateNumber(value.shots, "shots", true);

    const entry = new EntryEntity();
    Object.assign(entry, value);

    response.body = await this.entryRepository.addObject(entry);
  }
}
