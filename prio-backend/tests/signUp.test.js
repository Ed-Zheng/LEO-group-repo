import { jest } from "@jest/globals";

const createUserWithEmailAndPassword = jest.fn();

test("signup creates a Firebase Authentication account", async () => {
  createUserWithEmailAndPassword.mockResolvedValue({
    user: {
      uid: "test123",
      email: "test@test.com",
    },
  });

  const result = await createUserWithEmailAndPassword(
    {},
    "test@test.com",
    "123456"
  );

  expect(result.user).toBeDefined();
  expect(result.user.uid).toBe("test123");
  expect(result.user.email).toBe("test@test.com");
});