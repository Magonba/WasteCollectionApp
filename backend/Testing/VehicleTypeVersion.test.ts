import { exec } from 'child_process';
import dotenv from 'dotenv';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { MapArc } from '../Model/MapArc';
dotenv.config(); // necessary for accessing process.env variable
import { MapNode } from '../Model/MapNode';
import { VehicleTypeVersion } from '../Model/VehicleTypeVersion';

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

test('Get VehicleTypeVersions objects from database works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const arcs: MapArc[] = await MapArc.getArcsObjects('fribourg', nodes);
    const vehicleTypeVersions: VehicleTypeVersion[] = await VehicleTypeVersion.getVehicleTypeVersionsObjects(
        'fribourg',
        'Man20t',
        arcs,
    );

    vehicleTypeVersions.sort((vtv1, vtv2) => {
        if (vtv1.getTiming() > vtv2.getTiming()) return 1;
        if (vtv1.getTiming() < vtv2.getTiming()) return -1;
        return 0;
    });

    const firstVehicleTypeVersion: VehicleTypeVersion = vehicleTypeVersions[0];
    const lastVehicleTypeVersion: VehicleTypeVersion = vehicleTypeVersions[vehicleTypeVersions.length - 1];

    //first VehicleTypeVersion
    expect(firstVehicleTypeVersion.getTiming()).toEqual(new Date(2011, 4, 21, 10, 45, 30));
    expect(firstVehicleTypeVersion.getArcsActivated()[0][0].getSourceNode().getNodeID()).toEqual(1);
    expect(firstVehicleTypeVersion.getArcsActivated()[0][0].getDestinationNode().getNodeID()).toEqual(2);
    expect(firstVehicleTypeVersion.getArcsActivated()[0][1]).toEqual(true);
    expect(firstVehicleTypeVersion.getArcsActivated()[1][0].getSourceNode().getNodeID()).toEqual(2);
    expect(firstVehicleTypeVersion.getArcsActivated()[1][0].getDestinationNode().getNodeID()).toEqual(3);
    expect(firstVehicleTypeVersion.getArcsActivated()[1][1]).toEqual(true);
    expect(firstVehicleTypeVersion.getArcsActivated()[2][0].getSourceNode().getNodeID()).toEqual(3);
    expect(firstVehicleTypeVersion.getArcsActivated()[2][0].getDestinationNode().getNodeID()).toEqual(4);
    expect(firstVehicleTypeVersion.getArcsActivated()[2][1]).toEqual(true);

    //last VehicleTypeVersion
    expect(lastVehicleTypeVersion.getTiming()).toEqual(new Date(2012, 2, 31, 9, 30, 20));
    expect(lastVehicleTypeVersion.getArcsActivated()[0][0].getSourceNode().getNodeID()).toEqual(1);
    expect(lastVehicleTypeVersion.getArcsActivated()[0][0].getDestinationNode().getNodeID()).toEqual(2);
    expect(lastVehicleTypeVersion.getArcsActivated()[0][1]).toEqual(true);
    expect(lastVehicleTypeVersion.getArcsActivated()[1][0].getSourceNode().getNodeID()).toEqual(2);
    expect(lastVehicleTypeVersion.getArcsActivated()[1][0].getDestinationNode().getNodeID()).toEqual(3);
    expect(lastVehicleTypeVersion.getArcsActivated()[1][1]).toEqual(true);
    expect(lastVehicleTypeVersion.getArcsActivated()[2][0].getSourceNode().getNodeID()).toEqual(3);
    expect(lastVehicleTypeVersion.getArcsActivated()[2][0].getDestinationNode().getNodeID()).toEqual(4);
    expect(lastVehicleTypeVersion.getArcsActivated()[2][1]).toEqual(false);
});
