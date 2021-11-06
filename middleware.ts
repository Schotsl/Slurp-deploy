import { verify } from "https://deno.land/x/djwt@v2.2/mod.ts";
import { Context } from "https://deno.land/x/oak@v7.6.3/mod.ts";
import { UberdenoError } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/errors.ts";

class InvalidAuthentication extends UberdenoError {
  public statusError = 403;

  constructor() {
    super("Bruh you finna pull this?");
  }
}

class MissingAuthentication extends UberdenoError {
  public statusError = 401;

  constructor() {
    super("Bruh you finna pull this?");
  }
}

// Fetch the variables and convert them to right datatype
const secret = "bruh";

export const authenticationHandler = async (
  ctx: Context,
  next: () => Promise<unknown>,
) => {
  // Get the JWT token from the Authorization header
  const header = ctx.request.headers.get("Authorization");
  const token = header?.split(" ")[1];

  if (token) {
    // Verify and decrypt the payload
    const payload = await verify(
      token,
      secret,
      "HS512",
    ).catch(() => {
      throw new InvalidAuthentication();
    });

    // Store the users UUID
    ctx.state.uuid = payload.uuid;

    await next();
    return;
  }

  throw new MissingAuthentication();
};
