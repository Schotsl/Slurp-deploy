import { create, verify } from "https://deno.land/x/djwt@v2.3/mod.ts";
import { initializeEnv } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.0/main/helper.ts";
import { Request, State } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {
  InvalidAuthorization,
  MissingAuthorization,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.0.0/main/errors.ts";

initializeEnv([
  "JWT_SECRET",
]);

const secret = Deno.env.get("JWT_SECRET");
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

export async function createToken(uuid: string) {
  return await create({ alg: "HS512", typ: "JWT" }, { uuid }, key);
}

export async function verifyToken(token: string) {
  return await verify(token, key).catch(() => {
    throw new InvalidAuthorization();
  });
}

export async function authorizationHandler(
  { request, state }: {
    request: Request;
    state: State;
  },
  next: () => Promise<unknown>,
): Promise<void> {
  const header = request.headers.get("Authorization");
  const token = header?.split(" ")[1];

  if (token) {
    const payload = await verifyToken(token);

    state.uuid = payload.uuid;

    await next();
    return;
  }

  throw new MissingAuthorization();
}
