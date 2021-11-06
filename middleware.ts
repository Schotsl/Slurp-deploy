import { create, verify } from "https://deno.land/x/djwt@v2.3/mod.ts";
import { Context } from "https://deno.land/x/oak@v9.0.1/mod.ts";
import { initializeEnv } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";
import {
  InvalidAuthentication,
  MissingAuthentication,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";

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

export async function createToken(uuid: string) {
  return await create({ alg: "HS512", typ: "JWT" }, { uuid }, key);
}

export async function verifyToken(token: string) {
  return await verify(token, key).catch(() => {
    throw new InvalidAuthentication();
  });
}

export async function authenticationHandler(
  ctx: Context,
  next: () => Promise<unknown>,
): Promise<void> {
  const header = ctx.request.headers.get("Authorization");
  const token = header?.split(" ")[1];

  if (token) {
    const payload = await verifyToken(token);

    ctx.state.uuid = payload.uuid;

    await next();
    return;
  }

  throw new MissingAuthentication();
}
