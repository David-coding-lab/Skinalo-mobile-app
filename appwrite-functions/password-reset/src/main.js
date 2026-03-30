import { Client, Users } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
    const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!endpoint || !projectId || !apiKey) {
      return res.json(
        { ok: false, error: "Function environment is not configured." },
        500,
      );
    }

    const sessionUserId = req.headers?.["x-appwrite-user-id"];
    if (!sessionUserId) {
      return res.json({ ok: false, error: "Unauthorized" }, 401);
    }

    let payload = {};
    if (typeof req.body === "string" && req.body.length > 0) {
      payload = JSON.parse(req.body);
    } else if (req.body && typeof req.body === "object") {
      payload = req.body;
    }

    const { password, userId } = payload;
    if (!password || typeof password !== "string" || password.length < 8) {
      return res.json(
        { ok: false, error: "Password must be at least 8 characters long." },
        400,
      );
    }

    if (userId && userId !== sessionUserId) {
      return res.json(
        { ok: false, error: "User mismatch for password reset." },
        403,
      );
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const users = new Users(client);
    await users.updatePassword(sessionUserId, password);

    return res.json({ ok: true }, 200);
  } catch (err) {
    error(`Password reset function failed: ${err?.message || err}`);
    return res.json({ ok: false, error: "Password reset failed." }, 500);
  }
};
