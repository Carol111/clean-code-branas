import { isValidPassword } from "../../src/validatePassword";

test("Deve validar a senha", async () => {
  const password = "asdQWE123"
  const isValid = isValidPassword(password);
  expect(isValid).toBe(true);
})

test.each([
    "asd",
    "asdqwerty",
    "123456789",
    "asd456789",
    "ASDQWERTY",
  ])("Não deve validar a senha %s", async (password: string) => {
  const isValid = isValidPassword(password);
  expect(isValid).toBe(false);
})