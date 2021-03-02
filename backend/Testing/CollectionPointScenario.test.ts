import { exec } from 'child_process';
import dotenv from 'dotenv';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
dotenv.config(); // necessary for accessing process.env variable
import { CollectionPointScenario } from '../Model/CollectionPointScenario';
import { CollectionPointScenarioVersion } from '../Model/CollectionPointScenarioVersion';
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

test('Get CollectionPointScenarios objects from database works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const collectionPointScenarios: CollectionPointScenario[] = await CollectionPointScenario.getCollectionPointScenariosObjects(
        'fribourg',
        nodes,
    );

    collectionPointScenarios.sort((cps1, cps2) => {
        if (cps1.getTitle() > cps2.getTitle()) return 1;
        if (cps1.getTitle() < cps2.getTitle()) return -1;
        return 0;
    });

    const firstCollectionPointScenario: CollectionPointScenario = collectionPointScenarios[0];
    const lastCollectionPointScenario: CollectionPointScenario =
        collectionPointScenarios[collectionPointScenarios.length - 1];

    //first CollectionPointScenario
    expect(firstCollectionPointScenario.getTitle()).toEqual('BigContainers');
    expect(firstCollectionPointScenario.getCollectionPointScenarioVersions()).toEqual(
        await CollectionPointScenarioVersion.getCollectionPointScenarioVersionsObjects(
            'fribourg',
            'BigContainers',
            nodes,
        ),
    );

    //last CollectionPointScenario
    expect(lastCollectionPointScenario.getTitle()).toEqual('SmallContainers');
    expect(lastCollectionPointScenario.getCollectionPointScenarioVersions()).toEqual(
        await CollectionPointScenarioVersion.getCollectionPointScenarioVersionsObjects(
            'fribourg',
            'SmallContainers',
            nodes,
        ),
    );
});
