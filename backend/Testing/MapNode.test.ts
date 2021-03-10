import { exec } from 'child_process';
import dotenv from 'dotenv';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
dotenv.config(); // necessary for accessing process.env variable
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

test('Get Nodes objects from database works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');

    nodes.sort((node1, node2) => {
        if (node1.getNodeID() > node2.getNodeID()) return 1;
        if (node1.getNodeID() < node2.getNodeID()) return -1;
        return 0;
    });

    const firstNode: MapNode | undefined = nodes[0];
    const lastNode: MapNode | undefined = nodes[nodes.length - 1];

    //first node
    expect(firstNode.getNodeID()).toEqual(1);
    expect(firstNode.getXCoordinate()).toEqual(123);
    expect(firstNode.getYCoordinate()).toEqual(23);
    expect(firstNode.getVehicleDepot()).toEqual(true);
    expect(firstNode.getWasteDepot()).toEqual(false);

    //last node
    expect(lastNode.getNodeID()).toEqual(4);
    expect(lastNode.getXCoordinate()).toEqual(765);
    expect(lastNode.getYCoordinate()).toEqual(19);
    expect(lastNode.getVehicleDepot()).toEqual(false);
    expect(lastNode.getWasteDepot()).toEqual(true);
});

test('createNode works properly', async () => {
    const node: MapNode = await MapNode.createNode('fribourg', 5, 7687, 897, true, true);

    //query the db for the new node
    const nodesFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.nodes`);

    //expect row to be in database
    expect(nodesFromDB).toContainEqual({
        nodeid: 5,
        xcoordinate: 7687,
        ycoordinate: 897,
        vehicledepot: true,
        wastedepot: true,
    });

    //test if node object is fine
    expect(node.getNodeID()).toEqual(5);
    expect(node.getXCoordinate()).toEqual(7687);
    expect(node.getYCoordinate()).toEqual(897);
    expect(node.getVehicleDepot()).toEqual(true);
    expect(node.getWasteDepot()).toEqual(true);
});
