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
    expect(firstResult.getTours()[0].getTourID()).toEqual(3);

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
                if (tour1.getTourID() > tour2.getTourID()) return 1;
                if (tour1.getTourID() < tour2.getTourID()) return -1;
                return 0;
            })[0]
            .getTourID(),
    ).toEqual(1);
    expect(
        lastResult
            .getTours()
            .sort((tour1, tour2) => {
                if (tour1.getTourID() > tour2.getTourID()) return 1;
                if (tour1.getTourID() < tour2.getTourID()) return -1;
                return 0;
            })[1]
            .getTourID(),
    ).toEqual(2);
});
