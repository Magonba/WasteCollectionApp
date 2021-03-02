import { exec } from 'child_process';
import dotenv from 'dotenv';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
dotenv.config(); // necessary for accessing process.env variable
import { MapNode } from '../Model/MapNode';
import { CollectionPointScenarioVersion } from '../Model/CollectionPointScenarioVersion';

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

test('Get CollectionPointScenarioVersions objects from database works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const collectionPointScenarioVersions: CollectionPointScenarioVersion[] = await CollectionPointScenarioVersion.getCollectionPointScenarioVersionsObjects(
        'fribourg',
        'SmallContainers',
        nodes,
    );

    collectionPointScenarioVersions.sort((cpsv1, cpsv2) => {
        if (cpsv1.getTiming() > cpsv2.getTiming()) return 1;
        if (cpsv1.getTiming() < cpsv2.getTiming()) return -1;
        return 0;
    });

    const firstCollectionPointScenarioVersion: CollectionPointScenarioVersion = collectionPointScenarioVersions[0];
    const lastCollectionPointScenarioVersion: CollectionPointScenarioVersion =
        collectionPointScenarioVersions[collectionPointScenarioVersions.length - 1];

    //first CollectionPointScenarioVersion
    expect(firstCollectionPointScenarioVersion.getTiming()).toEqual(new Date(2015, 4, 21, 10, 45, 30));
    expect(firstCollectionPointScenarioVersion.getNodesPotCP()[0][0].getNodeID()).toEqual(1);
    expect(firstCollectionPointScenarioVersion.getNodesPotCP()[0][1]).toEqual(true);
    expect(firstCollectionPointScenarioVersion.getNodesPotCP()[1][0].getNodeID()).toEqual(2);
    expect(firstCollectionPointScenarioVersion.getNodesPotCP()[1][1]).toEqual(true);
    expect(firstCollectionPointScenarioVersion.getNodesPotCP()[2][0].getNodeID()).toEqual(3);
    expect(firstCollectionPointScenarioVersion.getNodesPotCP()[2][1]).toEqual(false);

    //last CollectionPointScenarioVersion
    expect(lastCollectionPointScenarioVersion.getTiming()).toEqual(new Date(2016, 2, 31, 9, 30, 20));
    expect(lastCollectionPointScenarioVersion.getNodesPotCP()[0][0].getNodeID()).toEqual(1);
    expect(lastCollectionPointScenarioVersion.getNodesPotCP()[0][1]).toEqual(true);
    expect(lastCollectionPointScenarioVersion.getNodesPotCP()[1][0].getNodeID()).toEqual(2);
    expect(lastCollectionPointScenarioVersion.getNodesPotCP()[1][1]).toEqual(false);
    expect(lastCollectionPointScenarioVersion.getNodesPotCP()[2][0].getNodeID()).toEqual(3);
    expect(lastCollectionPointScenarioVersion.getNodesPotCP()[2][1]).toEqual(false);
});
