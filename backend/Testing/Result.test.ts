import { exec } from 'child_process';
import dotenv from 'dotenv';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
dotenv.config(); // necessary for accessing process.env variable
import { MapNode } from '../Model/MapNode';
import { GarbageScenario } from '../Model/GarbageScenario';
import { CollectionPointScenario } from '../Model/CollectionPointScenario';
import { VehicleType } from '../Model/VehicleType';
import { Result } from '../Model/Result';
import { MapArc } from '../Model/MapArc';
import { Graph } from '../Model/Graph';
import { GarbageScenarioVersion } from '../Model/GarbageScenarioVersion';
import { VehicleTypeVersion } from '../Model/VehicleTypeVersion';
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

test('Get Result objects from database works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const arcs: MapArc[] = await MapArc.getArcsObjects('fribourg', nodes);
    const graph: Graph = await Graph.getGraphObject('fribourg');
    const garbageScenarios: GarbageScenario[] = await GarbageScenario.getGarbageScenariosObjects('fribourg', nodes);
    const collectionPointScenarios: CollectionPointScenario[] = await CollectionPointScenario.getCollectionPointScenariosObjects(
        'fribourg',
        nodes,
    );
    const vehicleTypes: VehicleType[] = await VehicleType.getVehicleTypesObjects('fribourg', arcs);

    const results: Result[] = await Result.getResultsObjects(
        'fribourg',
        garbageScenarios,
        collectionPointScenarios,
        vehicleTypes,
        graph.getNodes(),
    );

    results.sort((res1, res2) => {
        if (res1.getTiming() > res2.getTiming()) return 1;
        if (res1.getTiming() < res2.getTiming()) return -1;
        return 0;
    });

    const firstResult: Result = results[0];
    const lastResult: Result = results[1];

    //first Result
    expect(firstResult.getTiming()).toEqual(new Date(2007, 5, 11, 3, 25, 11));
    expect(firstResult.getGarbageScenarioVersion().getTiming()).toEqual(new Date(2019, 6, 29, 7, 21, 32));
    expect(firstResult.getCollectionPointScenarioVersion().getTiming()).toEqual(new Date(2013, 5, 11, 3, 25, 11));
    expect(firstResult.getVehicleTypeVersions()[0].getTiming()).toEqual(new Date(2011, 4, 21, 10, 45, 30));
    expect(firstResult.getModel()).toEqual('K3');
    expect(firstResult.getMaxWalkingDistance()).toEqual(912);
    expect(firstResult.getTotalTime()).toEqual(451);
    expect(firstResult.getTours()[0].getTourTiming()).toEqual(new Date(2001, 7, 11, 1, 18, 39));

    //last Result
    expect(lastResult.getTiming()).toEqual(new Date(2008, 5, 11, 3, 25, 11));
    expect(lastResult.getGarbageScenarioVersion().getTiming()).toEqual(new Date(2018, 4, 21, 10, 45, 30));
    expect(lastResult.getCollectionPointScenarioVersion().getTiming()).toEqual(new Date(2015, 4, 21, 10, 45, 30));
    expect(
        lastResult
            .getVehicleTypeVersions()
            .sort((vtv1, vtv2) => {
                if (vtv1.getTiming() > vtv2.getTiming()) return 1;
                if (vtv1.getTiming() < vtv2.getTiming()) return -1;
                return 0;
            })[0]
            .getTiming(),
    ).toEqual(new Date(2009, 5, 11, 3, 25, 11));
    expect(
        lastResult
            .getVehicleTypeVersions()
            .sort((vtv1, vtv2) => {
                if (vtv1.getTiming() > vtv2.getTiming()) return 1;
                if (vtv1.getTiming() < vtv2.getTiming()) return -1;
                return 0;
            })[1]
            .getTiming(),
    ).toEqual(new Date(2011, 4, 21, 10, 45, 30));
    expect(lastResult.getModel()).toEqual('K1');
    expect(lastResult.getMaxWalkingDistance()).toEqual(798);
    expect(lastResult.getTotalTime()).toEqual(324);
    expect(
        lastResult
            .getTours()
            .sort((tour1, tour2) => {
                if (tour1.getTourTiming() > tour2.getTourTiming()) return 1;
                if (tour1.getTourTiming() < tour2.getTourTiming()) return -1;
                return 0;
            })[0]
            .getTourTiming(),
    ).toEqual(new Date(2006, 3, 10, 2, 15, 23));
    expect(
        lastResult
            .getTours()
            .sort((tour1, tour2) => {
                if (tour1.getTourTiming() > tour2.getTourTiming()) return 1;
                if (tour1.getTourTiming() < tour2.getTourTiming()) return -1;
                return 0;
            })[1]
            .getTourTiming(),
    ).toEqual(new Date(2010, 0, 7, 11, 23, 9));
});

test('CreateResult works properly', async () => {
    //setup for Result creation
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const nodesWaste: [MapNode, number][] = [
        [nodes[0], 687],
        [nodes[1], 456],
        [nodes[2], 569],
    ];
    const nodesPotCP: [MapNode, boolean][] = [
        [nodes[0], true],
        [nodes[1], true],
        [nodes[2], false],
    ];
    const arcs: MapArc[] = await MapArc.getArcsObjects('fribourg', nodes);
    const arcsActivated1: [MapArc, boolean][] = [
        [arcs[0], true],
        [arcs[1], false],
        [arcs[2], true],
    ];
    const arcsActivated2: [MapArc, boolean][] = [
        [arcs[0], false],
        [arcs[1], true],
        [arcs[2], false],
    ];
    const garbageScenarioVersion: GarbageScenarioVersion = await GarbageScenarioVersion.createGarbageScenarioVersion(
        'fribourg',
        'Summer',
        new Date(2006, 11, 11, 13, 9, 58),
        nodesWaste,
    );
    const collectionPointScenarioVersion: CollectionPointScenarioVersion = await CollectionPointScenarioVersion.createCollectionPointScenarioVersion(
        'fribourg',
        'BigContainers',
        new Date(2010, 8, 25, 13, 9, 55),
        nodesPotCP,
    );
    const vehicleTypeVersion1: VehicleTypeVersion = await VehicleTypeVersion.createVehicleTypeVersion(
        'fribourg',
        'Man20t',
        new Date(2000, 4, 8, 12, 8, 33),
        arcsActivated1,
    );
    const vehicleTypeVersion2: VehicleTypeVersion = await VehicleTypeVersion.createVehicleTypeVersion(
        'fribourg',
        'Man20t',
        new Date(2010, 5, 9, 13, 9, 34),
        arcsActivated2,
    );
    const vehicleTypeVersions = [vehicleTypeVersion1, vehicleTypeVersion2];

    //create Result
    const result: Result = await Result.createResult(
        'fribourg',
        new Date(1999, 6, 10, 14, 3, 11),
        garbageScenarioVersion,
        collectionPointScenarioVersion,
        vehicleTypeVersions,
        'K2',
        65,
    );

    //query the db for the new result
    const ressFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.results`);

    //expect row to be in database
    expect(ressFromDB).toContainEqual({
        timing: new Date(1999, 6, 10, 14, 3, 11),
        titlegarbsc: garbageScenarioVersion.getGSTitle(),
        timinggarbsc: garbageScenarioVersion.getTiming(),
        titlecpsc: collectionPointScenarioVersion.getCPSTitle(),
        timingcpsc: collectionPointScenarioVersion.getTiming(),
        model: 'K2',
        maxwalkingdistance: 65,
        totaltime: 0,
    });

    //inspect result object
    expect(result.getTiming()).toEqual(new Date(1999, 6, 10, 14, 3, 11));
    expect(result.getGarbageScenarioVersion()).toEqual(garbageScenarioVersion);
    expect(result.getCollectionPointScenarioVersion()).toEqual(collectionPointScenarioVersion);
    expect(result.getVehicleTypeVersions()).toEqual(vehicleTypeVersions);
    expect(result.getModel()).toEqual('K2');
    expect(result.getMaxWalkingDistance()).toEqual(65);
    expect(result.getTotalTime()).toEqual(0);
    expect(result.getCompleted()).toEqual(false);
});

test('setTours works properly', async () => {
    //setup for Result creation
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const nodesWaste: [MapNode, number][] = [
        [nodes[0], 687],
        [nodes[1], 456],
        [nodes[2], 569],
    ];
    const nodesPotCP: [MapNode, boolean][] = [
        [nodes[0], true],
        [nodes[1], true],
        [nodes[2], false],
    ];
    const arcs: MapArc[] = await MapArc.getArcsObjects('fribourg', nodes);
    const arcsActivated1: [MapArc, boolean][] = [
        [arcs[0], true],
        [arcs[1], false],
        [arcs[2], true],
    ];
    const arcsActivated2: [MapArc, boolean][] = [
        [arcs[0], false],
        [arcs[1], true],
        [arcs[2], false],
    ];
    const garbageScenarioVersion: GarbageScenarioVersion = await GarbageScenarioVersion.createGarbageScenarioVersion(
        'fribourg',
        'Summer',
        new Date(2006, 11, 11, 13, 9, 58),
        nodesWaste,
    );
    const collectionPointScenarioVersion: CollectionPointScenarioVersion = await CollectionPointScenarioVersion.createCollectionPointScenarioVersion(
        'fribourg',
        'BigContainers',
        new Date(2010, 8, 25, 13, 9, 55),
        nodesPotCP,
    );
    const vehicleTypeVersion1: VehicleTypeVersion = await VehicleTypeVersion.createVehicleTypeVersion(
        'fribourg',
        'Man20t',
        new Date(2000, 4, 8, 12, 8, 33),
        arcsActivated1,
    );
    const vehicleTypeVersion2: VehicleTypeVersion = await VehicleTypeVersion.createVehicleTypeVersion(
        'fribourg',
        'Man20t',
        new Date(2010, 5, 9, 13, 9, 34),
        arcsActivated2,
    );
    const vehicleTypeVersions = [vehicleTypeVersion1, vehicleTypeVersion2];

    //create Result
    const result: Result = await Result.createResult(
        'fribourg',
        new Date(1999, 6, 10, 14, 3, 11),
        garbageScenarioVersion,
        collectionPointScenarioVersion,
        vehicleTypeVersions,
        'K2',
        65,
    );

    const timing1: Date = new Date(2005, 4, 27, 7, 59, 1);
    const timing2: Date = new Date(2004, 4, 27, 7, 59, 1);
    const timing3: Date = new Date(2003, 4, 27, 7, 59, 1);

    const tourtime1 = 837;
    const tourtime2 = 963;
    const tourtime3 = 432;

    const tourwaste1 = 6784;
    const tourwaste2 = 7874;
    const tourwaste3 = 8743;

    const tourNodes1: [MapNode, number, number][] = [
        [nodes[0], 687, 1],
        [nodes[1], 456, 2],
        [nodes[2], 569, 3],
    ];
    const tourNodes2: [MapNode, number, number][] = [
        [nodes[0], 789, 1],
        [nodes[1], 925, 2],
        [nodes[2], 520, 3],
    ];
    const tourNodes3: [MapNode, number, number][] = [
        [nodes[0], 120, 1],
        [nodes[1], 382, 2],
        [nodes[2], 231, 3],
    ];

    const toursData: [Date, number, number, [MapNode, number, number][]][] = [
        [timing1, tourtime1, tourwaste1, tourNodes1],
        [timing2, tourtime2, tourwaste2, tourNodes2],
        [timing3, tourtime3, tourwaste3, tourNodes3],
    ];

    await result.setTours('fribourg', toursData);

    expect(result.getTotalTime()).toEqual(tourtime1 + tourtime2 + tourtime3);

    expect(result.getTours()[0].getTourTiming()).toEqual(timing1);
    expect(result.getTours()[0].getTourTime()).toEqual(tourtime1);
    expect(result.getTours()[0].getTourWaste()).toEqual(tourwaste1);
    expect(result.getTours()[0].getTourNodes()).toEqual(tourNodes1);

    expect(result.getTours()[1].getTourTiming()).toEqual(timing2);
    expect(result.getTours()[1].getTourTime()).toEqual(tourtime2);
    expect(result.getTours()[1].getTourWaste()).toEqual(tourwaste2);
    expect(result.getTours()[1].getTourNodes()).toEqual(tourNodes2);

    expect(result.getTours()[2].getTourTiming()).toEqual(timing3);
    expect(result.getTours()[2].getTourTime()).toEqual(tourtime3);
    expect(result.getTours()[2].getTourWaste()).toEqual(tourwaste3);
    expect(result.getTours()[2].getTourNodes()).toEqual(tourNodes3);

    //check if reassignment of tours is possible (should not be possible)
    toursData[0][0] = new Date(1980, 6, 6, 7, 59, 1);
    await result.setTours('fribourg', toursData);
    expect(result.getTours()[0].getTourTiming()).not.toEqual(new Date(1980, 6, 6, 7, 59, 1));
});
