import { validateCpf } from "../src/validateCpf";

test("Deve validar um CPF", async () => {
  //given
  const cpf = "97456321558";
  //when
  const isValid = validateCpf(cpf);
  //then
  expect(isValid).toBe(true);
})

test("Não deve validar o CPF", async () => {
  //given
  const cpf = "11111111111";
  //when
  const isValid = validateCpf(cpf);
  //then
  expect(isValid).toBe(false);
})