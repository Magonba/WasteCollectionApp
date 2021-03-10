import { exec } from 'child_process';
import dotenv from 'dotenv';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
dotenv.config(); // necessary for accessing process.env variable
import { MapNode } from '../Model/MapNode';
import { GarbageScenarioVersion } from '../Model/GarbageScenarioVersion';

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

test('Get GarbageScenarioVersions objects from database works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const garbageScenarioVersions: GarbageScenarioVersion[] = await GarbageScenarioVersion.getGarbageScenarioVersionsObjects(
        'fribourg',
        'Summer',
        nodes,
    );

    garbageScenarioVersions.sort((gsv1, gsv2) => {
        if (gsv1.getTiming() > gsv2.getTiming()) return 1;
        if (gsv1.getTiming() < gsv2.getTiming()) return -1;
        return 0;
    });

    const firstGarbageScenarioVersion: GarbageScenarioVersion = garbageScenarioVersions[0];
    const lastGarbageScenarioVersion: GarbageScenarioVersion =
        garbageScenarioVersions[garbageScenarioVersions.length - 1];

    //first GarbageScenarioVersion
    expect(firstGarbageScenarioVersion.getTiming()).toEqual(new Date(2017, 2, 31, 9, 30, 20));
    expect(firstGarbageScenarioVersion.getNodesWaste()[0][0].getNodeID()).toEqual(1);
    expect(firstGarbageScenarioVersion.getNodesWaste()[0][1]).toEqual(567);
    expect(firstGarbageScenarioVersion.getNodesWaste()[1][0].getNodeID()).toEqual(2);
    expect(firstGarbageScenarioVersion.getNodesWaste()[1][1]).toEqual(735);
    expect(firstGarbageScenarioVersion.getNodesWaste()[2][0].getNodeID()).toEqual(3);
    expect(firstGarbageScenarioVersion.getNodesWaste()[2][1]).toEqual(903);

    //last GarbageScenarioVersion
    expect(lastGarbageScenarioVersion.getTiming()).toEqual(new Date(2018, 4, 21, 10, 45, 30));
    expect(lastGarbageScenarioVersion.getNodesWaste()[0][0].getNodeID()).toEqual(1);
    expect(lastGarbageScenarioVersion.getNodesWaste()[0][1]).toEqual(602);
    expect(lastGarbageScenarioVersion.getNodesWaste()[1][0].getNodeID()).toEqual(2);
    expect(lastGarbageScenarioVersion.getNodesWaste()[1][1]).toEqual(789);
    expect(lastGarbageScenarioVersion.getNodesWaste()[2][0].getNodeID()).toEqual(3);
    expect(lastGarbageScenarioVersion.getNodesWaste()[2][1]).toEqual(1043);
});

test('Create GarbageScenarioVersion works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    nodes.sort((node1, node2) => {
        if (node1.getNodeID() > node2.getNodeID()) return 1;
        if (node1.getNodeID() < node2.getNodeID()) return -1;
        return 0;
    });

    const date: Date = new Date(2010, 5, 9, 13, 9, 34);

    const nodesWaste: [MapNode, number][] = [
        [nodes[0], 687],
        [nodes[1], 456],
        [nodes[2], 569],
    ];

    const garbageScenarioVersion: GarbageScenarioVersion = await GarbageScenarioVersion.createGarbageScenarioVersion(
        'fribourg',
        'Summer',
        date,
        nodesWaste,
    );

    //query the db for the new gsv
    const gsvsFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.garbagescenarioversions`);

    //expect row to be in database
    expect(gsvsFromDB).toContainEqual({
        title: 'Summer',
        timing: date,
    });

    const timingToString = `${date.getFullYear()}-${
        date.getMonth() + 1
    }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;

    const gsvnodesFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(
        `SELECT * FROM fribourg.garbagescenarioversions_nodes_waste WHERE title = 'Summer' AND timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS')`,
    );

    expect(gsvnodesFromDB).toContainEqual({
        nodeid: 1,
        title: 'Summer',
        timing: date,
        wasteamount: 687,
    });
    expect(gsvnodesFromDB).toContainEqual({
        nodeid: 2,
        title: 'Summer',
        timing: date,
        wasteamount: 456,
    });
    expect(gsvnodesFromDB).toContainEqual({
        nodeid: 3,
        title: 'Summer',
        timing: date,
        wasteamount: 569,
    });

    //test if gsv object is fine
    expect(garbageScenarioVersion.getTiming()).toEqual(date);
    expect(garbageScenarioVersion.getNodesWaste()).toEqual([
        [nodes[0], 687],
        [nodes[1], 456],
        [nodes[2], 569],
    ]);
    expect(garbageScenarioVersion.getGSTitle()).toEqual('Summer');
});
