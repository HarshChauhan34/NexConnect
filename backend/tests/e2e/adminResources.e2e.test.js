import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../app.js";
import User from "../../models/User.js";
import { clearTestDb, connectTestDb, disconnectTestDb } from "../helpers/testDb.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
process.env.REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "test_refresh_secret";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

describe("organizer resource e2e", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it("allows organizers to create and delete their own event/product", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Organizer User",
      email: "organizer@example.com",
      password: "StrongPass@123",
    });

    expect(registerRes.status).toBe(201);

    await User.findOneAndUpdate(
      { email: "organizer@example.com" },
      { role: "organizer" },
    );

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "organizer@example.com",
      password: "StrongPass@123",
    });

    expect(loginRes.status).toBe(200);
    const authHeader = `Bearer ${loginRes.body.token}`;

    const eventRes = await request(app)
      .post("/api/events")
      .set("Authorization", authHeader)
      .send({
        title: "E2E Event",
        category: "Technology",
        city: "Bengaluru",
        date: new Date().toISOString(),
        description: "End-to-end event creation test",
      });

    expect(eventRes.status).toBe(201);

    const productRes = await request(app)
      .post("/api/products")
      .set("Authorization", authHeader)
      .send({
        name: "E2E Product",
        type: "SaaS",
        price: 10,
        rating: 4.5,
        description: "End-to-end product creation test",
      });

    expect(productRes.status).toBe(201);

    const deleteEventRes = await request(app)
      .delete(`/api/events/${eventRes.body._id}`)
      .set("Authorization", authHeader);

    const deleteProductRes = await request(app)
      .delete(`/api/products/${productRes.body._id}`)
      .set("Authorization", authHeader);

    expect(deleteEventRes.status).toBe(200);
    expect(deleteProductRes.status).toBe(200);

    const summaryRes = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", authHeader);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.stats.totalProducts).toBe(0);
  });

  it("prevents organizers from deleting events/products owned by another organizer", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Owner Organizer",
      email: "owner@example.com",
      password: "StrongPass@123",
    });
    await User.findOneAndUpdate({ email: "owner@example.com" }, { role: "organizer" });

    const ownerLoginRes = await request(app).post("/api/auth/login").send({
      email: "owner@example.com",
      password: "StrongPass@123",
    });
    const ownerAuthHeader = `Bearer ${ownerLoginRes.body.token}`;

    const ownerEventRes = await request(app)
      .post("/api/events")
      .set("Authorization", ownerAuthHeader)
      .send({
        title: "Owner Event",
        category: "Technology",
        city: "Bengaluru",
        date: new Date().toISOString(),
      });

    const ownerProductRes = await request(app)
      .post("/api/products")
      .set("Authorization", ownerAuthHeader)
      .send({
        name: "Owner Product",
        type: "SaaS",
        price: 20,
      });

    expect(ownerEventRes.status).toBe(201);
    expect(ownerProductRes.status).toBe(201);

    await request(app).post("/api/auth/register").send({
      name: "Other Organizer",
      email: "other@example.com",
      password: "StrongPass@123",
    });
    await User.findOneAndUpdate({ email: "other@example.com" }, { role: "organizer" });

    const otherLoginRes = await request(app).post("/api/auth/login").send({
      email: "other@example.com",
      password: "StrongPass@123",
    });
    const otherAuthHeader = `Bearer ${otherLoginRes.body.token}`;

    const deleteEventRes = await request(app)
      .delete(`/api/events/${ownerEventRes.body._id}`)
      .set("Authorization", otherAuthHeader);

    const deleteProductRes = await request(app)
      .delete(`/api/products/${ownerProductRes.body._id}`)
      .set("Authorization", otherAuthHeader);

    expect(deleteEventRes.status).toBe(403);
    expect(deleteProductRes.status).toBe(403);
  });

  it("blocks admins from creating events/products", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "StrongPass@123",
    });
    expect(registerRes.status).toBe(201);

    await User.findOneAndUpdate({ email: "admin@example.com" }, { role: "admin" });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "StrongPass@123",
    });
    const authHeader = `Bearer ${loginRes.body.token}`;

    const eventRes = await request(app)
      .post("/api/events")
      .set("Authorization", authHeader)
      .send({
        title: "Admin Block Event",
        category: "Technology",
        city: "Delhi",
        date: new Date().toISOString(),
      });

    const productRes = await request(app)
      .post("/api/products")
      .set("Authorization", authHeader)
      .send({
        name: "Admin Block Product",
        type: "SaaS",
        price: 15,
      });

    expect(eventRes.status).toBe(403);
    expect(productRes.status).toBe(403);
  });
});
