import { isValidUUID } from "../../src/validateUUID";

test("Deve validar o UUID", async () => {
  const isValid = isValidUUID("00000000-0000-0000-0000-000000000000");
  expect(isValid).toBe(true);
});

test("Não deve validar o UUID", async () => {
  const isValid = isValidUUID("123");
  expect(isValid).toBe(false);
});
