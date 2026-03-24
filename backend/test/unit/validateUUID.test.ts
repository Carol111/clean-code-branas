import { isValidUUID } from "../../src/validateUUID";

describe("validateUUID", () => {
  test("Should validate the UUID", async () => {
    const isValid = isValidUUID("00000000-0000-0000-0000-000000000000");
    expect(isValid).toBe(true);
  });

  test("Should not validate the UUID", async () => {
    const isValid = isValidUUID("123");
    expect(isValid).toBe(false);
  });
});
