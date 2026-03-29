import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
  quiet: true,
});

process.env.NODE_ENV = "test";
