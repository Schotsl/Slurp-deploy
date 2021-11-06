import { create } from "https://deno.land/x/djwt@v2.3/mod.ts";
import { Client } from "https://deno.land/x/mysql@v2.10.1/mod.ts";
import { initializeEnv } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";
import { Request, Response } from "https://deno.land/x/oak@v9.0.1/mod.ts";

import ServerEntity from "../entity/ServerEntity.ts";
import ServerRepository from "../repository/ServerRepository.ts";
import InterfaceController from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/controller/InterfaceController.ts";

// TODO: Could probably be moved to external file

initializeEnv([
  "SLURP_SERVER_JWT_SECRET",
]);

const secret = Deno.env.get("SLURP_SERVER_JWT_SECRET");
const encoder = new TextEncoder();
const encoded = encoder.encode(secret!);

const format = "raw";
const usages: KeyUsage[] = ["sign", "verify"];
const algorithm = { name: "HMAC", hash: "SHA-512" };
const extractable = true;

const key = await crypto.subtle.importKey(
  format,
  encoded,
  algorithm,
  extractable,
  usages,
);

async function createToken(uuid: string) {
  return await create({ alg: "HS512", typ: "JWT" }, { uuid }, key);
}

export default class ServerController implements InterfaceController {
  private serverRepository: ServerRepository;

  constructor(mysqlClient: Client) {
    this.serverRepository = new ServerRepository(mysqlClient);
  }

  async getCollection(
    { request, response }: { request: Request; response: Response },
  ) {
    const limit = Number(request.url.searchParams.get(`limit`));
    const offset = Number(request.url.searchParams.get(`offset`));

    response.body = await this.serverRepository.getCollection(
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
    await this.serverRepository.removeObject(params.uuid);

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

    // TODO: Prevent non existing properties from being copied

    const server = new ServerEntity(params.uuid);
    Object.assign(server, value);

    response.body = await this.serverRepository.updateObject(server);
  }

  async addObject(
    { request, response }: { request: Request; response: Response },
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
