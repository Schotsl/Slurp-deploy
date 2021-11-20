import { red } from "https://deno.land/std@0.110.0/fmt/colors.ts";
import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { MissingImplementation } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";
import {
  validateBoolean,
  validateTinyint,
  validateUUID,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/validation.ts";
import {
  Request,
  Response,
  State,
} from "https://deno.land/x/oak@v9.0.1/mod.ts";

import EntryEntity from "../entity/EntryEntity.ts";
import EntryRepository from "../repository/EntryRepository.ts";
import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";

export default class EntryController implements InterfaceController {
  private entryRepository: EntryRepository;

  constructor(mysqlClient: Client) {
    this.entryRepository = new EntryRepository(mysqlClient);
  }

  async getCollection(
    { response, state }: {
      response: Response;
      state: State;
    },
  ) {
    const offset = state.offset;
    const server = state.uuid;
    const limit = state.limit;

    response.body = await this.entryRepository.getCollection(
      offset,
      limit,
      server,
    );
  }

  async removeObject(
    { response, params, state }: {
      response: Response;
      request: Request;
      params: { uuid: string };
      state: State;
    },
  ) {
    await this.entryRepository.removeObject(params.uuid, state.uuid);

    response.status = 204;
  }

  updateObject() {
    throw new MissingImplementation();
  }

  async addObject(
    { response, request, state }: {
      response: Response;
      request: Request;
      state: State;
    },
  ) {
    const body = await request.body();
    const value = await body.value;

    delete value.uuid;
    value.server = state.uuid;

    validateUUID(value.player, "player");

    validateTinyint(value.sips, "sips", true);
    validateTinyint(value.shots, "shots", true);
    validateBoolean(value.giveable, "giveable", true);

    if (value.sips > 0 || value.shots > 0) {
      fetch("http://80.61.199.248:9173/hue/group", { method: "post" })
        .catch(() => console.log(red(`Couldn't alert lights`)));
    }

    const entry = new EntryEntity();
    Object.assign(entry, value);

    response.body = await this.entryRepository.addObject(entry);
  }
}
