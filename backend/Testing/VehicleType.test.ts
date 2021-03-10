import { exec } from 'child_process';
import dotenv from 'dotenv';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
dotenv.config(); // necessary for accessing process.env variable
import { VehicleType } from '../Model/VehicleType';
import { VehicleTypeVersion } from '../Model/VehicleTypeVersion';
import { MapNode } from '../Model/MapNode';
import { MapArc } from '../Model/MapArc';
import { Graph } from '../Model/Graph';
import { GarbageScenario } from '../Model/GarbageScenario';
import { CollectionPointScenario } from '../Model/CollectionPointScenario';
import { Result } from '../Model/Result';

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

test('Get VehicleTypes objects from database works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const arcs: MapArc[] = await MapArc.getArcsObjects('fribourg', nodes);
    const vehicleTypes: VehicleType[] = await VehicleType.getVehicleTypesObjects('fribourg', arcs);

    vehicleTypes.sort((vt1, vt2) => {
        if (vt1.getTitle() > vt2.getTitle()) return 1;
        if (vt1.getTitle() < vt2.getTitle()) return -1;
        return 0;
    });

    const firstVehicleType: VehicleType = vehicleTypes[0];
    const lastVehicleType: VehicleType = vehicleTypes[vehicleTypes.length - 1];

    //first VehicleType
    expect(firstVehicleType.getTitle()).toEqual('Man20t');
    expect(firstVehicleType.getVehicleTypeVersions()).toEqual(
        await VehicleTypeVersion.getVehicleTypeVersionsObjects('fribourg', 'Man20t', arcs),
    );

    //last VehicleType
    expect(lastVehicleType.getTitle()).toEqual('Volkswagen3.5t');
    expect(lastVehicleType.getVehicleTypeVersions()).toEqual(
        await VehicleTypeVersion.getVehicleTypeVersionsObjects('fribourg', 'Volkswagen3.5t', arcs),
    );
});

test('CreateVehicleType works properly', async () => {
    const vehicleType: VehicleType = await VehicleType.createVehicleType('fribourg', 'Mercedes10t', 6782, 624, 913);

    //query the db for the new vt
    const vtssFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.vehicletypes`);

    //expect row to be in database
    expect(vtssFromDB).toContainEqual({
        title: 'Mercedes10t',
        averagespeed: 6782,
        averagestoptime: 624,
        vehiclecapacity: 913,
    });

    //inspect vt object
    expect(vehicleType.getTitle()).toEqual('Mercedes10t');
    expect(vehicleType.getAverageSpeed()).toEqual(6782);
    expect(vehicleType.getAverageStopTime()).toEqual(624);
    expect(vehicleType.getVehicleCapacity()).toEqual(913);
});

test('SetTitle works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const arcs: MapArc[] = await MapArc.getArcsObjects('fribourg', nodes);
    const vehicleTypes: VehicleType[] = await VehicleType.getVehicleTypesObjects('fribourg', arcs);

    const avSpeed: number = vehicleTypes[0].getAverageSpeed();
    const avStopTime: number = vehicleTypes[0].getAverageStopTime();
    const vehCap: number = vehicleTypes[0].getVehicleCapacity();

    await vehicleTypes[0].setTitle('fribourg', 'Mercedes10t');

    //query the db for the new vt
    const vtssFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.vehicletypes`);

    //expect row to be in database
    expect(vtssFromDB).toContainEqual({
        title: 'Mercedes10t',
        averagespeed: avSpeed,
        averagestoptime: avStopTime,
        vehiclecapacity: vehCap,
    });

    //inspect vt object
    expect(vehicleTypes[0].getTitle()).toEqual('Mercedes10t');
    for (let index = 0; index < vehicleTypes[0].getVehicleTypeVersions().length; index = index + 1) {
        expect(vehicleTypes[0].getVehicleTypeVersions()[index].getVTTitle()).toEqual('Mercedes10t');
    }
    expect(vehicleTypes[0].getAverageSpeed()).toEqual(avSpeed);
    expect(vehicleTypes[0].getAverageStopTime()).toEqual(avStopTime);
    expect(vehicleTypes[0].getVehicleCapacity()).toEqual(vehCap);
});

test('SetAverageSpeed works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const arcs: MapArc[] = await MapArc.getArcsObjects('fribourg', nodes);
    const vehicleTypes: VehicleType[] = await VehicleType.getVehicleTypesObjects('fribourg', arcs);

    const titleVeh: string = vehicleTypes[0].getTitle();
    const avStopTime: number = vehicleTypes[0].getAverageStopTime();
    const vehCap: number = vehicleTypes[0].getVehicleCapacity();

    await vehicleTypes[0].setAverageSpeed('fribourg', 890823);

    //query the db for the new vt
    const vtssFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.vehicletypes`);

    //expect row to be in database
    expect(vtssFromDB).toContainEqual({
        title: titleVeh,
        averagespeed: 890823,
        averagestoptime: avStopTime,
        vehiclecapacity: vehCap,
    });

    //inspect vt object
    expect(vehicleTypes[0].getTitle()).toEqual(titleVeh);
    expect(vehicleTypes[0].getAverageSpeed()).toEqual(890823);
    expect(vehicleTypes[0].getAverageStopTime()).toEqual(avStopTime);
    expect(vehicleTypes[0].getVehicleCapacity()).toEqual(vehCap);
});

test('SetAverageStopTime works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const arcs: MapArc[] = await MapArc.getArcsObjects('fribourg', nodes);
    const vehicleTypes: VehicleType[] = await VehicleType.getVehicleTypesObjects('fribourg', arcs);

    const titleVeh: string = vehicleTypes[0].getTitle();
    const avSpeed: number = vehicleTypes[0].getAverageSpeed();
    const vehCap: number = vehicleTypes[0].getVehicleCapacity();

    await vehicleTypes[0].setAverageStopTime('fribourg', 324676);

    //query the db for the new vt
    const vtssFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.vehicletypes`);

    //expect row to be in database
    expect(vtssFromDB).toContainEqual({
        title: titleVeh,
        averagespeed: avSpeed,
        averagestoptime: 324676,
        vehiclecapacity: vehCap,
    });

    //inspect vt object
    expect(vehicleTypes[0].getTitle()).toEqual(titleVeh);
    expect(vehicleTypes[0].getAverageSpeed()).toEqual(avSpeed);
    expect(vehicleTypes[0].getAverageStopTime()).toEqual(324676);
    expect(vehicleTypes[0].getVehicleCapacity()).toEqual(vehCap);
});

test('SetVehicleCapacity works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const arcs: MapArc[] = await MapArc.getArcsObjects('fribourg', nodes);
    const vehicleTypes: VehicleType[] = await VehicleType.getVehicleTypesObjects('fribourg', arcs);

    const titleVeh: string = vehicleTypes[0].getTitle();
    const avSpeed: number = vehicleTypes[0].getAverageSpeed();
    const avStopTime: number = vehicleTypes[0].getAverageStopTime();

    await vehicleTypes[0].setVehicleCapacity('fribourg', 642012);

    //query the db for the new vt
    const vtssFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.vehicletypes`);

    //expect row to be in database
    expect(vtssFromDB).toContainEqual({
        title: titleVeh,
        averagespeed: avSpeed,
        averagestoptime: avStopTime,
        vehiclecapacity: 642012,
    });

    //inspect vt object
    expect(vehicleTypes[0].getTitle()).toEqual(titleVeh);
    expect(vehicleTypes[0].getAverageSpeed()).toEqual(avSpeed);
    expect(vehicleTypes[0].getAverageStopTime()).toEqual(avStopTime);
    expect(vehicleTypes[0].getVehicleCapacity()).toEqual(642012);
});

test('AddVehicleTypeVersion works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    nodes.sort((node1, node2) => {
        if (node1.getNodeID() > node2.getNodeID()) return 1;
        if (node1.getNodeID() < node2.getNodeID()) return -1;
        return 0;
    });
    const arcs: MapArc[] = await MapArc.getArcsObjects('fribourg', nodes);
    arcs.sort((arc1, arc2) => {
        if (arc1.getSourceNode().getNodeID() > arc2.getSourceNode().getNodeID()) return 1;
        if (arc1.getSourceNode().getNodeID() < arc2.getSourceNode().getNodeID()) return -1;
        return 0;
    });

    const vehicleTypes: VehicleType[] = await VehicleType.getVehicleTypesObjects('fribourg', arcs);

    const vehicleType: VehicleType = vehicleTypes[0];

    const activatedArcs: [MapArc, boolean][] = [
        [arcs[0], true],
        [arcs[1], true],
        [arcs[2], false],
    ];

    const date: Date = new Date(2010, 5, 9, 13, 9, 34);

    await vehicleType.addVehicleTypeVersion('fribourg', date, activatedArcs);

    //query the db for the new vtv
    const vtvsFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.vehicletypeversions`);

    //expect row to be in database
    expect(vtvsFromDB).toContainEqual({
        title: vehicleType.getTitle(),
        timing: date,
    });

    const timingToString = `${date.getFullYear()}-${
        date.getMonth() + 1
    }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;

    const vtvarcsFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(
        `SELECT * FROM fribourg.vehicletypeversions_nodes_activatedarcs WHERE title = '${vehicleType.getTitle()}' AND timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS')`,
    );

    expect(vtvarcsFromDB).toContainEqual({
        sourcenodeid: 1,
        destinationnodeid: 2,
        title: vehicleType.getTitle(),
        timing: date,
        activated: true,
    });
    expect(vtvarcsFromDB).toContainEqual({
        sourcenodeid: 2,
        destinationnodeid: 3,
        title: vehicleType.getTitle(),
        timing: date,
        activated: true,
    });
    expect(vtvarcsFromDB).toContainEqual({
        sourcenodeid: 3,
        destinationnodeid: 4,
        title: vehicleType.getTitle(),
        timing: date,
        activated: false,
    });

    //test if vt object is fine
    expect(vehicleType.getVehicleTypeVersions()[vehicleType.getVehicleTypeVersions().length - 1].getTiming()).toEqual(
        date,
    );
    expect(
        vehicleType.getVehicleTypeVersions()[vehicleType.getVehicleTypeVersions().length - 1].getArcsActivated(),
    ).toEqual([
        [arcs[0], true],
        [arcs[1], true],
        [arcs[2], false],
    ]);
});

test('DeleteVehicleTypeVersion works properly', async () => {
    const graph: Graph = await Graph.getGraphObject('fribourg');
    const garbageScenarios: GarbageScenario[] = await GarbageScenario.getGarbageScenariosObjects(
        'fribourg',
        graph.getNodes(),
    );
    const collectionPointScenarios: CollectionPointScenario[] = await CollectionPointScenario.getCollectionPointScenariosObjects(
        'fribourg',
        graph.getNodes(),
    );
    const vehicleTypes: VehicleType[] = await VehicleType.getVehicleTypesObjects('fribourg', graph.getArcs());
    const vehicleType: VehicleType = vehicleTypes[0];
    const vehTypeTitle: string = vehicleType.getTitle();
    const results: Result[] = await Result.getResultsObjects(
        'fribourg',
        garbageScenarios,
        collectionPointScenarios,
        vehicleTypes,
        graph.getNodes(),
    );

    const timing1: Date = vehicleType.getVehicleTypeVersions()[0].getTiming();
    const timing2: Date = vehicleType.getVehicleTypeVersions()[1].getTiming();

    await vehicleType.deleteVehicleTypeVersion('fribourg', vehicleType.getVehicleTypeVersions()[0], results);

    //inspect vehicleType object
    expect(vehicleType.getVehicleTypeVersions().length).toEqual(1);
    expect(vehicleType.getVehicleTypeVersions()[0].getTiming()).not.toEqual(timing1);
    expect(vehicleType.getVehicleTypeVersions()[0].getTiming()).toEqual(timing2);
    expect(vehicleType.getVehicleTypeVersions()[1]).toEqual(undefined);

    //delete second and last cpsv
    await vehicleType.deleteVehicleTypeVersion('fribourg', vehicleType.getVehicleTypeVersions()[0], results);
    expect(vehicleType.getVehicleTypeVersions()).toEqual([]);

    //in setupSomeProjects.sql there are 2 results.
    //If title === 'Volkswagen3.5t' one result should be deleted.
    //Otherwise (if title === 'Man20t') 2 results should be deleted.

    const resultsFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.results`);

    if (vehTypeTitle === 'Man20t') {
        //console.log(resultsFromDB);
        //console.log(results);
        expect(resultsFromDB.length).toEqual(0);
        expect(results.length).toEqual(0);
    } else if (vehTypeTitle === 'Volkswagen3.5t') {
        expect(resultsFromDB.length).toEqual(1);
        expect(results.length).toEqual(1);
    }
});
