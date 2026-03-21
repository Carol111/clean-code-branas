import pgp from "pg-promise";

beforeAll(async () => {
  const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  await connection.query("DELETE FROM ccca.order");
  await connection.query("DELETE FROM ccca.account");
  await connection.$pool.end();
});
