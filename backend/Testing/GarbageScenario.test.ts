import { exec } from 'child_process';
import dotenv from 'dotenv';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
dotenv.config(); // necessary for accessing process.env variable
import { GarbageScenario } from '../Model/GarbageScenario';
import { GarbageScenarioVersion } from '../Model/GarbageScenarioVersion';
import { MapNode } from '../Model/MapNode';

beforeEach(async () => {
    //setup database
    await new Promise<void>((resolve, reject) => {
        exec(
            `${process.env.PROJECT_ROOT_PATH}/backend/Database/SQLQueryToDB.bash ${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST} ${process.env.DB_PORT} ${process.env.PROJECT_ROOT_PATH}/backend/Testing/setupSomeProjects.sql`,
            (err: Error | null, stdout: string | null, stderr: string | null) => {
                if (stdout !== null && stdout !== '') {
                    Logger.getLogger().dbLog(stdout, 'silly');
                }
                if (stderr !== null && stderr !== '') {
                    Logger.getLogger().dbLog(stderr, 'warn');
                }
                if (err !== null) {
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                    reject(err);
                }
                resolve();
            },
        );
    });
});

afterEach(async () => {
    //delete tables, schemas, etc.
    await new Promise<void>((resolve, reject) => {
        exec(
            `${process.env.PROJECT_ROOT_PATH}/backend/Database/SQLQueryToDB.bash ${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST} ${process.env.DB_PORT} ${process.env.PROJECT_ROOT_PATH}/backend/Testing/deleteSomeProjects.sql`,
            (err: Error | null, stdout: string | null, stderr: string | null) => {
                if (stdout !== null && stdout !== '') {
                    Logger.getLogger().dbLog(stdout, 'silly');
                }
                if (stderr !== null && stderr !== '') {
                    Logger.getLogger().dbLog(stderr, 'warn');
                }
                if (err !== null) {
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                    reject(err);
                }
                resolve();
            },
        );
    });
});

afterAll(async () => {
    //end Pool of DatabaseHandler (needed for proper teardown)
    const dbHandler = await DatabaseHandler.getDatabaseHandler();
    dbHandler.endPool();

    //delete tables, schemas, etc.
    await new Promise<void>((resolve, reject) => {
        exec(
            `${process.env.PROJECT_ROOT_PATH}/backend/Database/SQLQueryToDB.bash ${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST} ${process.env.DB_PORT} ${process.env.PROJECT_ROOT_PATH}/backend/Testing/deleteSomeProjects.sql`,
            (err: Error | null, stdout: string | null, stderr: string | null) => {
                if (stdout !== null && stdout !== '') {
                    Logger.getLogger().dbLog(stdout, 'silly');
                }
                if (stderr !== null && stderr !== '') {
                    Logger.getLogger().dbLog(stderr, 'warn');
                }
                if (err !== null) {
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                    reject(err);
                }
                resolve();
            },
        );
    });
});

test('Get GarbageScenarios objects from database works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const garbageScenarios: GarbageScenario[] = await GarbageScenario.getGarbageScenariosObjects('fribourg', nodes);

    garbageScenarios.sort((gs1, gs2) => {
        if (gs1.getTitle() > gs2.getTitle()) return 1;
        if (gs1.getTitle() < gs2.getTitle()) return -1;
        return 0;
    });

    const firstGarbageScenario: GarbageScenario = garbageScenarios[0];
    const lastGarbageScenario: GarbageScenario = garbageScenarios[garbageScenarios.length - 1];

    //first GarbageScenario
    expect(firstGarbageScenario.getTitle()).toEqual('Summer');
    expect(firstGarbageScenario.getGarbageScenarioVersions()).toEqual(
        await GarbageScenarioVersion.getGarbageScenarioVersionsObjects('fribourg', 'Summer', nodes),
    );

    //last GarbageScenario
    expect(lastGarbageScenario.getTitle()).toEqual('Winter');
    expect(lastGarbageScenario.getGarbageScenarioVersions()).toEqual(
        await GarbageScenarioVersion.getGarbageScenarioVersionsObjects('fribourg', 'Winter', nodes),
    );
});
