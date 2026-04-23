import { describe, expect, it } from "vitest";
import { registerSchema } from "../../validations/authSchemas.js";

describe("auth schema validation", () => {
  it("accepts valid register payload", () => {
    const result = registerSchema.safeParse({
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "StrongPass@123",
      },
      query: {},
      params: {},
    });

    expect(result.success).toBe(true);
  });

  it("rejects weak password", () => {
    const result = registerSchema.safeParse({
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "12345678",
      },
      query: {},
      params: {},
    });

    expect(result.success).toBe(false);
  });
});
