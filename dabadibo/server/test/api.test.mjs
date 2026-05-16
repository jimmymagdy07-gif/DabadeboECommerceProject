import { test, before } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../app.js";

before(() => {
  process.env.JWT_SECRET =
    process.env.JWT_SECRET || "test_jwt_secret_must_be_16+";
});

test("GET /api/health", async () => {
  const app = createApp();
  const res = await request(app).get("/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
});

test("GET /api/admin/stats بدون توكن → 401", async () => {
  const app = createApp();
  const res = await request(app).get("/api/admin/stats");
  assert.equal(res.status, 401);
});

test("POST /api/uploads/product-images بدون توكن → 401", async () => {
  const app = createApp();
  const res = await request(app).post("/api/uploads/product-images");
  assert.equal(res.status, 401);
});

test("POST /api/auth/login بجسم JSON تالف → 400", async () => {
  const app = createApp();
  const res = await request(app)
    .post("/api/auth/login")
    .set("Content-Type", "application/json")
    .send("{not-json");
  assert.equal(res.status, 400);
});
