import { isValidPassword } from "../../src/validatePassword";

describe("validatePassword", () => {
  test("Should validate the password", async () => {
    const password = "asdQWE123";
    const isValid = isValidPassword(password);
    expect(isValid).toBe(true);
  });

  test.each(["asd", "asdqwerty", "123456789", "asd456789", "ASDQWERTY"])(
    "Should not validate the password %s",
    async (password: string) => {
      const isValid = isValidPassword(password);
      expect(isValid).toBe(false);
    },
  );
});
