import { validatePassword } from "../../src/domain/validatePassword";

describe("validatePassword", () => {
  test("Should validate the password", async () => {
    const password = "asdQWE123";
    const isValid = validatePassword(password);
    expect(isValid).toBe(true);
  });

  test.each(["asd", "asdqwerty", "123456789", "asd456789", "ASDQWERTY"])(
    "Should not validate the password %s",
    async (password: string) => {
      const isValid = validatePassword(password);
      expect(isValid).toBe(false);
    },
  );
});
