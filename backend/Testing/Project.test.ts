import { exec } from 'child_process';
import dotenv from 'dotenv';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { CollectionPointScenario } from '../Model/CollectionPointScenario';
import { GarbageScenario } from '../Model/GarbageScenario';
import { Graph } from '../Model/Graph';
dotenv.config(); // necessary for accessing process.env variable
import { Project } from '../Model/Project';
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

test('CreateProject works properly', async () => {
    const project: Project = await Project.createProject('zurich');

    expect(project.getProjectName()).toEqual('zurich');
    expect(project.getGarbageScenarios()).toEqual([]);
    expect(project.getCollectionPointScenarios()).toEqual([]);
    expect(project.getVehicleTypes()).toEqual([]);
    expect(project.getResults()).toEqual([]);
    expect(project.getGraph().getNodes()).toEqual([]);
    expect(project.getGraph().getArcs()).toEqual([]);

    const schemaResult: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT schema_name FROM information_schema.schemata
    WHERE schema_name = 'zurich'`);

    expect(schemaResult).toContainEqual({ schema_name: 'zurich' });
});

test('Get Project object from database works properly', async () => {
    const project: Project = await Project.getProjectObject('fribourg');

    expect(project.getProjectName()).toEqual('fribourg');
    expect(project.getUsers()).toEqual([]);
    expect(project.getGraph()).toEqual(await Graph.getGraphObject('fribourg'));
    expect(
        project
            .getGarbageScenarios()
            .sort((gs1, gs2) => {
                if (gs1.getTitle() > gs2.getTitle()) return 1;
                if (gs1.getTitle() < gs2.getTitle()) return -1;
                return 0;
            })[0]
            .getTitle(),
    ).toEqual('Summer');
    expect(
        project
            .getGarbageScenarios()
            .sort((gs1, gs2) => {
                if (gs1.getTitle() > gs2.getTitle()) return 1;
                if (gs1.getTitle() < gs2.getTitle()) return -1;
                return 0;
            })[1]
            .getTitle(),
    ).toEqual('Winter');
    expect(
        project
            .getCollectionPointScenarios()
            .sort((cps1, cps2) => {
                if (cps1.getTitle() > cps2.getTitle()) return 1;
                if (cps1.getTitle() < cps2.getTitle()) return -1;
                return 0;
            })[0]
            .getTitle(),
    ).toEqual('BigContainers');
    expect(
        project
            .getCollectionPointScenarios()
            .sort((cps1, cps2) => {
                if (cps1.getTitle() > cps2.getTitle()) return 1;
                if (cps1.getTitle() < cps2.getTitle()) return -1;
                return 0;
            })[1]
            .getTitle(),
    ).toEqual('SmallContainers');
    expect(
        project
            .getVehicleTypes()
            .sort((vt1, vt2) => {
                if (vt1.getTitle() > vt2.getTitle()) return 1;
                if (vt1.getTitle() < vt2.getTitle()) return -1;
                return 0;
            })[0]
            .getTitle(),
    ).toEqual('Man20t');
    expect(
        project
            .getVehicleTypes()
            .sort((vt1, vt2) => {
                if (vt1.getTitle() > vt2.getTitle()) return 1;
                if (vt1.getTitle() < vt2.getTitle()) return -1;
                return 0;
            })[1]
            .getTitle(),
    ).toEqual('Volkswagen3.5t');
    expect(
        project
            .getResults()
            .sort((res1, res2) => {
                if (res1.getTiming() > res2.getTiming()) return 1;
                if (res1.getTiming() < res2.getTiming()) return -1;
                return 0;
            })[0]
            .getTiming(),
    ).toEqual(new Date(2007, 5, 11, 3, 25, 11));
    expect(
        project
            .getResults()
            .sort((res1, res2) => {
                if (res1.getTiming() > res2.getTiming()) return 1;
                if (res1.getTiming() < res2.getTiming()) return -1;
                return 0;
            })[1]
            .getTiming(),
    ).toEqual(new Date(2008, 5, 11, 3, 25, 11));
});

test('addGarbageScenario works properly', async () => {
    const project: Project = await Project.getProjectObject('fribourg');

    const gs: GarbageScenario = await project.addGarbageScenario('Fall');

    expect(project.getGarbageScenarios()).toContainEqual(gs);

    //query the db for the new gs
    const gssFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.garbagescenarios`);

    //expect row to be in database
    expect(gssFromDB).toContainEqual({
        title: 'Fall',
    });
});

test('deleteGarbageScenario works properly', async () => {
    const project: Project = await Project.getProjectObject('fribourg');

    const gs: GarbageScenario = await project.addGarbageScenario('Fall');

    await project.deleteGarbageScenario(gs);

    expect(project.getGarbageScenarios()).not.toContainEqual(gs);

    //query the db for the gs
    const gssFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.garbagescenarios`);

    //expect row to not be in database
    expect(gssFromDB).not.toContainEqual({
        title: 'Fall',
    });
});

test('addCollectionPointScenario works properly', async () => {
    const project: Project = await Project.getProjectObject('fribourg');

    const cps: CollectionPointScenario = await project.addCollectionPointScenario('MediumContainers');

    expect(project.getCollectionPointScenarios()).toContainEqual(cps);

    //query the db for the new gs
    const cpssFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.collectionpointscenarios`);

    //expect row to be in database
    expect(cpssFromDB).toContainEqual({
        title: 'MediumContainers',
    });
});

test('deleteCollectionPointScenario works properly', async () => {
    const project: Project = await Project.getProjectObject('fribourg');

    const cps: CollectionPointScenario = await project.addCollectionPointScenario('MediumContainers');

    await project.deleteCollectionPointScenario(cps);

    expect(project.getCollectionPointScenarios()).not.toContainEqual(cps);

    //query the db for the cps
    const cpssFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.collectionpointscenarios`);

    //expect row to not be in database
    expect(cpssFromDB).not.toContainEqual({
        title: 'MediumContainers',
    });
});

test('addVehicleType works properly', async () => {
    const project: Project = await Project.getProjectObject('fribourg');

    const vt: VehicleType = await project.addVehicleType('Lamborghini2.5t', 20, 15, 10);

    expect(project.getVehicleTypes()).toContainEqual(vt);

    //query the db for the new vt
    const vtsFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.vehicletypes`);

    //expect row to be in database
    expect(vtsFromDB).toContainEqual({
        title: 'Lamborghini2.5t',
        averagespeed: 20,
        averagestoptime: 15,
        vehiclecapacity: 10,
    });
});

test('deleteVehicleType works properly', async () => {
    const project: Project = await Project.getProjectObject('fribourg');

    const vt: VehicleType = await project.addVehicleType('Lamborghini2.5t', 20, 15, 10);

    await project.deleteVehicleType(vt);

    expect(project.getVehicleTypes()).not.toContainEqual(vt);

    //query the db for the new vt
    const vtsFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.vehicletypes`);

    //expect row to not be in database
    expect(vtsFromDB).not.toContainEqual({
        title: 'Lamborghini2.5t',
        averagespeed: 20,
        averagestoptime: 15,
        vehiclecapacity: 10,
    });
});

test('addResult works properly', async () => {
    const project: Project = await Project.getProjectObject('fribourg');

    const titlegarbsc: string = project.getGarbageScenarios()[0].getTitle();
    const timinggarbsc: Date = project.getGarbageScenarios()[0].getGarbageScenarioVersions()[0].getTiming();
    const titlecpsc: string = project.getCollectionPointScenarios()[0].getTitle();
    const timingcpsc: Date = project
        .getCollectionPointScenarios()[0]
        .getCollectionPointScenarioVersions()[0]
        .getTiming();

    const res: Result = await project.addResult(
        new Date(2007, 6, 8, 4, 4, 4),
        project.getGarbageScenarios()[0].getGarbageScenarioVersions()[0],
        project.getCollectionPointScenarios()[0].getCollectionPointScenarioVersions()[0],
        [
            project.getVehicleTypes()[0].getVehicleTypeVersions()[0],
            project.getVehicleTypes()[1].getVehicleTypeVersions()[0],
        ],
        'K1',
        20,
    );

    expect(project.getResults()).toContainEqual(res);

    //query the db for the new result
    const ressFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.results`);

    //expect row to be in database
    expect(ressFromDB).toContainEqual({
        timing: new Date(2007, 6, 8, 4, 4, 4),
        titlegarbsc: titlegarbsc,
        timinggarbsc: timinggarbsc,
        titlecpsc: titlecpsc,
        timingcpsc: timingcpsc,
        model: 'K1',
        maxwalkingdistance: 20,
        totaltime: 0,
    });
});

test('deleteResult works properly', async () => {
    const project: Project = await Project.getProjectObject('fribourg');

    const titlegarbsc: string = project.getGarbageScenarios()[0].getTitle();
    const timinggarbsc: Date = project.getGarbageScenarios()[0].getGarbageScenarioVersions()[0].getTiming();
    const titlecpsc: string = project.getGarbageScenarios()[0].getTitle();
    const timingcpsc: Date = project
        .getCollectionPointScenarios()[0]
        .getCollectionPointScenarioVersions()[0]
        .getTiming();

    const res: Result = await project.addResult(
        new Date(2007, 6, 8, 4, 4, 4),
        project.getGarbageScenarios()[0].getGarbageScenarioVersions()[0],
        project.getCollectionPointScenarios()[0].getCollectionPointScenarioVersions()[0],
        [
            project.getVehicleTypes()[0].getVehicleTypeVersions()[0],
            project.getVehicleTypes()[1].getVehicleTypeVersions()[0],
        ],
        'K1',
        20,
    );

    await project.deleteResult(res);

    expect(project.getResults()).not.toContainEqual(res);

    //query the db for the new vt
    const ressFromDB: Record<string, string | number | boolean | Date>[] = await (
        await DatabaseHandler.getDatabaseHandler()
    ).querying(`SELECT * FROM fribourg.results`);

    //expect row to not be in database
    expect(ressFromDB).not.toContainEqual({
        timing: new Date(2007, 6, 8, 4, 4, 4),
        titlegarbsc: titlegarbsc,
        timinggarbsc: timinggarbsc,
        titlecpsc: titlecpsc,
        timingcpsc: timingcpsc,
        model: 'K1',
        maxwalkingdistance: 20,
        totaltime: 0,
    });
});
