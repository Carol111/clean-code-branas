import { validateCpf } from "../src/validateCpf";

test("Deve testar um CPF válido", async () => {
  //given
  const cpf = "97456321558";
  //when
  const isValid = validateCpf(cpf);
  //then
  expect(isValid).toBe(true);
})