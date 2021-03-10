import { exec } from 'child_process';
import dotenv from 'dotenv';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { CollectionPointScenario } from '../Model/CollectionPointScenario';
dotenv.config(); // necessary for accessing process.env variable
import { GarbageScenario } from '../Model/GarbageScenario';
import { GarbageScenarioVersion } from '../Model/GarbageScenarioVersion';
import { MapNode } from '../Model/MapNode';
import { Result } from '../Model/Result';
import { VehicleType } from '../Model/VehicleType';
import { Graph } from '../Model/Graph';

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

test('CreateGarbageScenario works properly', async () => {
    const garbageScenario: GarbageScenario = await GarbageScenario.createGarbageScenario('fribourg', 'Fall');

    //query the db for the new gs
    const gssFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.garbagescenarios`);

    //expect row to be in database
    expect(gssFromDB).toContainEqual({
        title: 'Fall',
    });

    //inspect gs object
    expect(garbageScenario.getTitle()).toEqual('Fall');
});

test('SetTitle works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const garbageScenarios: GarbageScenario[] = await GarbageScenario.getGarbageScenariosObjects('fribourg', nodes);

    await garbageScenarios[0].setTitle('fribourg', 'Fall');

    //query the db for the new gs
    const gssFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.garbagescenarios`);

    //expect row to be in database
    expect(gssFromDB).toContainEqual({
        title: 'Fall',
    });

    //inspect gs object
    expect(garbageScenarios[0].getTitle()).toEqual('Fall');
    for (let index = 0; index < garbageScenarios[0].getGarbageScenarioVersions().length; index = index + 1) {
        expect(garbageScenarios[0].getGarbageScenarioVersions()[index].getGSTitle()).toEqual('Fall');
    }
});

test('AddGarbageScenarioVersion works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    nodes.sort((node1, node2) => {
        if (node1.getNodeID() > node2.getNodeID()) return 1;
        if (node1.getNodeID() < node2.getNodeID()) return -1;
        return 0;
    });

    const garbageScenarios: GarbageScenario[] = await GarbageScenario.getGarbageScenariosObjects('fribourg', nodes);

    const garbageScenario: GarbageScenario = garbageScenarios[0];

    const nodesWaste: [MapNode, number][] = [
        [nodes[0], 687],
        [nodes[1], 456],
        [nodes[2], 569],
    ];

    const date: Date = new Date(2010, 5, 9, 13, 9, 34);

    await garbageScenario.addGarbageScenarioVersion('fribourg', date, nodesWaste);

    //query the db for the new gsv
    const gsvsFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.garbagescenarioversions`);

    //expect row to be in database
    expect(gsvsFromDB).toContainEqual({
        title: garbageScenario.getTitle(),
        timing: date,
    });

    const timingToString = `${date.getFullYear()}-${
        date.getMonth() + 1
    }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;

    const gsvnodesFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(
        `SELECT * FROM fribourg.garbagescenarioversions_nodes_waste WHERE title = '${garbageScenario.getTitle()}' AND timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS')`,
    );

    expect(gsvnodesFromDB).toContainEqual({
        nodeid: 1,
        title: garbageScenario.getTitle(),
        timing: date,
        wasteamount: 687,
    });
    expect(gsvnodesFromDB).toContainEqual({
        nodeid: 2,
        title: garbageScenario.getTitle(),
        timing: date,
        wasteamount: 456,
    });
    expect(gsvnodesFromDB).toContainEqual({
        nodeid: 3,
        title: garbageScenario.getTitle(),
        timing: date,
        wasteamount: 569,
    });

    //test if gs object is fine
    expect(
        garbageScenario
            .getGarbageScenarioVersions()
            [garbageScenario.getGarbageScenarioVersions().length - 1].getTiming(),
    ).toEqual(date);
    expect(
        garbageScenario
            .getGarbageScenarioVersions()
            [garbageScenario.getGarbageScenarioVersions().length - 1].getNodesWaste(),
    ).toEqual([
        [nodes[0], 687],
        [nodes[1], 456],
        [nodes[2], 569],
    ]);
});

test('DeleteGarbageScenarioVersion works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const garbageScenarios: GarbageScenario[] = await GarbageScenario.getGarbageScenariosObjects('fribourg', nodes);
    const garbageScenario: GarbageScenario = garbageScenarios[0];

    const graph: Graph = await Graph.getGraphObject('fribourg');
    const collectionPointScenarios: CollectionPointScenario[] = await CollectionPointScenario.getCollectionPointScenariosObjects(
        'fribourg',
        graph.getNodes(),
    );
    const vehicleTypes: VehicleType[] = await VehicleType.getVehicleTypesObjects('fribourg', graph.getArcs());
    const results: Result[] = await Result.getResultsObjects(
        'fribourg',
        garbageScenarios,
        collectionPointScenarios,
        vehicleTypes,
        graph.getNodes(),
    );

    const timing1: Date = garbageScenario.getGarbageScenarioVersions()[0].getTiming();
    const timing2: Date = garbageScenario.getGarbageScenarioVersions()[1].getTiming();

    await garbageScenario.deleteGarbageScenarioVersion(
        'fribourg',
        garbageScenario.getGarbageScenarioVersions()[0],
        results,
    );

    //inspect garbageScenario object
    expect(garbageScenario.getGarbageScenarioVersions().length).toEqual(1);
    expect(garbageScenario.getGarbageScenarioVersions()[0].getTiming()).not.toEqual(timing1);
    expect(garbageScenario.getGarbageScenarioVersions()[0].getTiming()).toEqual(timing2);
    expect(garbageScenario.getGarbageScenarioVersions()[1]).toEqual(undefined);

    //delete second and last gsv
    await garbageScenario.deleteGarbageScenarioVersion(
        'fribourg',
        garbageScenario.getGarbageScenarioVersions()[0],
        results,
    );
    expect(garbageScenario.getGarbageScenarioVersions()).toEqual([]);

    const resultsGSFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.results WHERE titlegarbsc = '${garbageScenario.getTitle()}'`);

    //db properly updated
    expect(resultsGSFromDB).toEqual([]);

    //results in memory properly updated
    expect(results.length).toEqual(1);
});
