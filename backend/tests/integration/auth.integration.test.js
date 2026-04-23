import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../app.js";
import { clearTestDb, connectTestDb, disconnectTestDb } from "../helpers/testDb.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
process.env.REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "test_refresh_secret";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

describe("auth integration", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it("registers, logs in, and refreshes session", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Integration User",
      email: "integration@example.com",
      password: "StrongPass@123",
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token).toBeTruthy();
    expect(registerRes.headers["set-cookie"]).toBeTruthy();

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "integration@example.com",
      password: "StrongPass@123",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeTruthy();

    const cookie = loginRes.headers["set-cookie"][0];
    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookie);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.token).toBeTruthy();
  });
});
