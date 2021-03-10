import { exec } from 'child_process';
import dotenv from 'dotenv';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
dotenv.config(); // necessary for accessing process.env variable
import { CollectionPointScenario } from '../Model/CollectionPointScenario';
import { CollectionPointScenarioVersion } from '../Model/CollectionPointScenarioVersion';
import { GarbageScenario } from '../Model/GarbageScenario';
import { Graph } from '../Model/Graph';
import { MapNode } from '../Model/MapNode';
import { Result } from '../Model/Result';
import { VehicleType } from '../Model/VehicleType';

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

test('CreateCollectionPointScenario works properly', async () => {
    const collectionPointScenario: CollectionPointScenario = await CollectionPointScenario.createCollectionPointScenario(
        'fribourg',
        'MediumContainers',
    );

    //query the db for the new gs
    const cpssFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.collectionpointscenarios`);

    //expect row to be in database
    expect(cpssFromDB).toContainEqual({
        title: 'MediumContainers',
    });

    //inspect gs object
    expect(collectionPointScenario.getTitle()).toEqual('MediumContainers');
});

test('SetTitle works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const collectionPointScenarios: CollectionPointScenario[] = await CollectionPointScenario.getCollectionPointScenariosObjects(
        'fribourg',
        nodes,
    );

    await collectionPointScenarios[0].setTitle('fribourg', 'MediumContainers');

    //query the db for the new gs
    const cpssFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.collectionpointscenarios`);

    //expect row to be in database
    expect(cpssFromDB).toContainEqual({
        title: 'MediumContainers',
    });

    //inspect cps object
    expect(collectionPointScenarios[0].getTitle()).toEqual('MediumContainers');
    for (
        let index = 0;
        index < collectionPointScenarios[0].getCollectionPointScenarioVersions().length;
        index = index + 1
    ) {
        expect(collectionPointScenarios[0].getCollectionPointScenarioVersions()[index].getCPSTitle()).toEqual(
            'MediumContainers',
        );
    }
});

test('AddCollectionPointScenarioVersion works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    nodes.sort((node1, node2) => {
        if (node1.getNodeID() > node2.getNodeID()) return 1;
        if (node1.getNodeID() < node2.getNodeID()) return -1;
        return 0;
    });

    const collectionPointScenarios: CollectionPointScenario[] = await CollectionPointScenario.getCollectionPointScenariosObjects(
        'fribourg',
        nodes,
    );

    const collectionPointScenario: CollectionPointScenario = collectionPointScenarios[0];

    const nodesPotCP: [MapNode, boolean][] = [
        [nodes[0], true],
        [nodes[1], true],
        [nodes[2], false],
    ];

    const date: Date = new Date(2010, 5, 9, 13, 9, 34);

    await collectionPointScenario.addCollectionPointScenarioVersion('fribourg', date, nodesPotCP);

    //query the db for the new gsv
    const cpsvsFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.collectionpointscenarioversions`);

    //expect row to be in database
    expect(cpsvsFromDB).toContainEqual({
        title: collectionPointScenario.getTitle(),
        timing: date,
    });

    const timingToString = `${date.getFullYear()}-${
        date.getMonth() + 1
    }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;

    const cpsvnodesFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(
        `SELECT * FROM fribourg.collectionpointscenarioversions_nodes_potcp WHERE title = '${collectionPointScenario.getTitle()}' AND timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS')`,
    );

    expect(cpsvnodesFromDB).toContainEqual({
        nodeid: 1,
        title: collectionPointScenario.getTitle(),
        timing: date,
        potentialcollectionpoint: true,
    });
    expect(cpsvnodesFromDB).toContainEqual({
        nodeid: 2,
        title: collectionPointScenario.getTitle(),
        timing: date,
        potentialcollectionpoint: true,
    });
    expect(cpsvnodesFromDB).toContainEqual({
        nodeid: 3,
        title: collectionPointScenario.getTitle(),
        timing: date,
        potentialcollectionpoint: false,
    });

    //test if gs object is fine
    expect(
        collectionPointScenario
            .getCollectionPointScenarioVersions()
            [collectionPointScenario.getCollectionPointScenarioVersions().length - 1].getTiming(),
    ).toEqual(date);
    expect(
        collectionPointScenario
            .getCollectionPointScenarioVersions()
            [collectionPointScenario.getCollectionPointScenarioVersions().length - 1].getNodesPotCP(),
    ).toEqual([
        [nodes[0], true],
        [nodes[1], true],
        [nodes[2], false],
    ]);
});

test('DeleteCollectionPointScenarioVersion works properly', async () => {
    const graph: Graph = await Graph.getGraphObject('fribourg');
    const garbageScenarios: GarbageScenario[] = await GarbageScenario.getGarbageScenariosObjects(
        'fribourg',
        graph.getNodes(),
    );
    const collectionPointScenarios: CollectionPointScenario[] = await CollectionPointScenario.getCollectionPointScenariosObjects(
        'fribourg',
        graph.getNodes(),
    );
    const collectionPointScenario: CollectionPointScenario = collectionPointScenarios[0];
    const vehicleTypes: VehicleType[] = await VehicleType.getVehicleTypesObjects('fribourg', graph.getArcs());
    const results: Result[] = await Result.getResultsObjects(
        'fribourg',
        garbageScenarios,
        collectionPointScenarios,
        vehicleTypes,
        graph.getNodes(),
    );

    const timing1: Date = collectionPointScenario.getCollectionPointScenarioVersions()[0].getTiming();
    const timing2: Date = collectionPointScenario.getCollectionPointScenarioVersions()[1].getTiming();

    await collectionPointScenario.deleteCollectionPointScenarioVersion(
        'fribourg',
        collectionPointScenario.getCollectionPointScenarioVersions()[0],
        results,
    );

    //inspect collectionPointScenario object
    expect(collectionPointScenario.getCollectionPointScenarioVersions().length).toEqual(1);
    expect(collectionPointScenario.getCollectionPointScenarioVersions()[0].getTiming()).not.toEqual(timing1);
    expect(collectionPointScenario.getCollectionPointScenarioVersions()[0].getTiming()).toEqual(timing2);
    expect(collectionPointScenario.getCollectionPointScenarioVersions()[1]).toEqual(undefined);

    //delete second and last cpsv
    await collectionPointScenario.deleteCollectionPointScenarioVersion(
        'fribourg',
        collectionPointScenario.getCollectionPointScenarioVersions()[0],
        results,
    );
    expect(collectionPointScenario.getCollectionPointScenarioVersions()).toEqual([]);

    const resultsCPSFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.results WHERE titlecpsc = '${collectionPointScenario.getTitle()}'`);

    //db properly updated
    expect(resultsCPSFromDB).toEqual([]);

    //results in memory properly updated
    expect(results.length).toEqual(1);
});
