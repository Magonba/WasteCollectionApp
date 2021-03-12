import { Model } from '../Model/Model';
import Router from 'koa-router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa2-cors';
import logger from 'koa-logger';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // necessary for accessing process.env variable

export class Controller {
    private static controller: Controller | undefined;
    private model: Model;
    private koaApp: Koa = new Koa();
    private router: Router = new Router();

    constructor(model: Model) {
        this.model = model;
    }

    public static async createController(): Promise<Controller> {
        if (typeof Controller.controller === 'undefined') {
            //create Controller
            Controller.controller = new Controller(await Model.createModel());

            //setup api endpoints
            await Controller.controller.setupEndpoints();

            //setup koaApp
            Controller.controller.koaApp
                .use(bodyParser())
                .use(
                    cors({
                        origin: '*',
                    }),
                )
                .use(Controller.controller.router.routes())
                .use(Controller.controller.router.allowedMethods())
                .use(logger());

            Controller.controller.koaApp.listen(process.env.API_PORT, async () => {
                console.log(`Listening on port: ${process.env.API_PORT}`);
            });
        }
        return Controller.controller;
    }

    private async setupEndpoints() {
        this.router.get('/', async () => {
            console.log('API is working');
        });
    }
}
