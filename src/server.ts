import "./util/module-alias";
import { Server } from "@overnightjs/core";
import { Application } from "express";
import bodyParser from "body-parser";
import expressPino from "express-pino-logger";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { OpenApiValidator } from "express-openapi-validator/dist";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import apiSchema from "./api.schema.json";
import { ForecastController } from "./controllers/forecast";
import { BeachesController } from "./controllers/beaches";
import { UsersController } from "./controllers/users";
import * as database from "@src/database";
import logger from "./logger";
import { apiErrorValidator } from "./middlewares/api-error-validator";

export class SetupServer extends Server {
  constructor(private port = 3000) {
    // nao passamos o init direto no construtor porque como a
    // requisicao eh assincrona, nao queremos colocar uma promise
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    await this.docsSetup();
    this.setupControllers();
    await this.databaseSetup();
    this.setupErrorsHandlers();
  }

  private setupExpress(): void {
    // passamos a middleware bodyParser para o express
    this.app.use(bodyParser.json());
    this.app.use(expressPino({ logger }));
    this.app.use(
      cors({
        origin: "*",
      })
    );
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UsersController();
    this.addControllers([
      forecastController,
      beachesController,
      usersController,
    ]);
  }

  private setupErrorsHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  private async docsSetup(): Promise<void> {
    this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(apiSchema));
    await new OpenApiValidator({
      apiSpec: apiSchema as OpenAPIV3.Document,
      validateRequests: true,
      validateResponses: true,
    }).install(this.app);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info("Server listening on port: " + this.port);
    });
  }
}
