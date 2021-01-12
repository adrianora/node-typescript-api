import "./util/module-alias";
import { Server } from "@overnightjs/core";
import { Application } from "express";
import bodyParser from "body-parser";
import { ForecastController } from "./controllers/forecast";
import { BeachesController } from "./controllers/beaches";
import { UsersController } from "./controllers/users";
import * as database from "@src/database";

export class SetupServer extends Server {
  constructor(private port = 3000) {
    // nao passamos o init direto no construtor porque como a
    // requisicao eh assincrona, nao queremos colocar uma promise
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.databaseSetup();
  }

  private setupExpress(): void {
    // passamos a middleware bodyParser para o express
    this.app.use(bodyParser.json());
    this.setupControllers();
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
      console.info("Server listening on port: " + this.port);
    });
  }
}
