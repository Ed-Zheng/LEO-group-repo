import request from "supertest";
import express from "express";
import userRoutes from "../routes/userRoutes.js";

const app = express();
app.use(express.json());
app.use("/users", userRoutes);

describe("POST /users", () => {
  test("creates a user in Firestore via backend", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        uid: "test123",
        name: "Test User",
        email: "test@test.com",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User created");
  });
});