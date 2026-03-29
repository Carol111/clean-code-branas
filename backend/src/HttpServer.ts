import express, { Express, Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";

export default interface HttpServer {
  route(method: string, url: string, callback: Function): void;
  listen(port: number): void;
}

export class ExpressAdapter implements HttpServer {
  app: Express;
  server: any;
  corsOptions = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
  };

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(cors(this.corsOptions));
    this.server = createServer(this.app);
  }

  route(
    method: "get" | "post" | "put" | "delete",
    url: string,
    callback: Function,
  ): void {
    this.app[method](url, async (req: Request, res: Response) => {
      try {
        const output = await callback(req.params, req.body);
        res.json(output);
      } catch (e: any) {
        res.status(422).json({
          error: e.message,
        });
      }
    });
  }

  listen(port: number): void {
    this.server.listen(port);
  }
}
