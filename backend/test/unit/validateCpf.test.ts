import { validateCpf } from "../../src/validateCpf";

describe("validateCpf", () => {
  test.each([
    "97456321558",
    "71428793860",
    "87748248800",
    "877.482.488-00",
    "877.482.48800",
    "877.48248800",
  ])("Should validate CPF %s", async (cpf: string) => {
    const isValid = validateCpf(cpf);
    expect(isValid).toBe(true);
  });

  test.each([null, undefined, "111", "11111111111", "abc"])(
    "Should not validate CPF %s",
    async (cpf: any) => {
      const isValid = validateCpf(cpf);
      expect(isValid).toBe(false);
    },
  );
});
