import { exec } from 'child_process';
import dotenv from 'dotenv';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
dotenv.config(); // necessary for accessing process.env variable
import { Tour } from '../Model/Tour';
import { MapNode } from '../Model/MapNode';
import { Client } from 'pg';
import * as HelperFunctions from './HelperFunctions.test';
let client: Client; // for psql db queries

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

beforeAll(async () => {
    //setup pg client connection
    client = new Client({
        connectionString: 'postgresql://wastecollectiondata:wastecollectiondata@localhost:5432/wastecollectiondata', // postgresql://user:password@server:portnb/dbname
    });
    await client.connect();
});

afterAll(async () => {
    //end pg client connection
    await client.end();

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

test('Get Tour objects from database works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    const tours: Tour[] = await Tour.getToursObjects('fribourg', new Date(2008, 5, 11, 3, 25, 11), nodes);

    tours.sort((tour1, tour2) => {
        if (tour1.getTourTiming() > tour2.getTourTiming()) return 1;
        if (tour1.getTourTiming() < tour2.getTourTiming()) return -1;
        return 0;
    });

    const firstTour: Tour = tours[0];
    const lastTour: Tour = tours[tours.length - 1];

    //first Tour
    //sorting nodes since they might be unordered (since they come from an sql query)
    expect(firstTour.getTourTiming()).toEqual(new Date(2006, 3, 10, 2, 15, 23));
    expect(firstTour.getTourTime()).toEqual(543);
    expect(firstTour.getTourWaste()).toEqual(1093);
    expect(
        firstTour
            .getTourNodes()
            .sort((nodeArr1, nodeArr2) => {
                if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
                if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
                return 0;
            })[0][0]
            .getNodeID(),
    ).toEqual(1);
    expect(
        firstTour.getTourNodes().sort((nodeArr1, nodeArr2) => {
            if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
            if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
            return 0;
        })[0][1],
    ).toEqual(323);
    expect(
        firstTour.getTourNodes().sort((nodeArr1, nodeArr2) => {
            if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
            if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
            return 0;
        })[0][2],
    ).toEqual(3);

    expect(
        firstTour
            .getTourNodes()
            .sort((nodeArr1, nodeArr2) => {
                if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
                if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
                return 0;
            })[1][0]
            .getNodeID(),
    ).toEqual(2);
    expect(
        firstTour.getTourNodes().sort((nodeArr1, nodeArr2) => {
            if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
            if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
            return 0;
        })[1][1],
    ).toEqual(376);
    expect(
        firstTour.getTourNodes().sort((nodeArr1, nodeArr2) => {
            if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
            if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
            return 0;
        })[1][2],
    ).toEqual(2);

    expect(
        firstTour
            .getTourNodes()
            .sort((nodeArr1, nodeArr2) => {
                if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
                if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
                return 0;
            })[2][0]
            .getNodeID(),
    ).toEqual(3);
    expect(
        firstTour.getTourNodes().sort((nodeArr1, nodeArr2) => {
            if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
            if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
            return 0;
        })[2][1],
    ).toEqual(312);
    expect(
        firstTour.getTourNodes().sort((nodeArr1, nodeArr2) => {
            if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
            if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
            return 0;
        })[2][2],
    ).toEqual(1);

    //last Tour
    expect(lastTour.getTourTiming()).toEqual(new Date(2010, 0, 7, 11, 23, 9));
    expect(lastTour.getTourTime()).toEqual(123);
    expect(lastTour.getTourWaste()).toEqual(874);
    expect(
        lastTour
            .getTourNodes()
            .sort((nodeArr1, nodeArr2) => {
                if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
                if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
                return 0;
            })[0][0]
            .getNodeID(),
    ).toEqual(1);
    expect(
        lastTour.getTourNodes().sort((nodeArr1, nodeArr2) => {
            if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
            if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
            return 0;
        })[0][1],
    ).toEqual(209);
    expect(
        lastTour.getTourNodes().sort((nodeArr1, nodeArr2) => {
            if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
            if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
            return 0;
        })[0][2],
    ).toEqual(1);

    expect(
        lastTour
            .getTourNodes()
            .sort((nodeArr1, nodeArr2) => {
                if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
                if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
                return 0;
            })[1][0]
            .getNodeID(),
    ).toEqual(2);
    expect(
        lastTour.getTourNodes().sort((nodeArr1, nodeArr2) => {
            if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
            if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
            return 0;
        })[1][1],
    ).toEqual(190);
    expect(
        lastTour.getTourNodes().sort((nodeArr1, nodeArr2) => {
            if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
            if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
            return 0;
        })[1][2],
    ).toEqual(2);

    expect(
        lastTour
            .getTourNodes()
            .sort((nodeArr1, nodeArr2) => {
                if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
                if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
                return 0;
            })[2][0]
            .getNodeID(),
    ).toEqual(3);
    expect(
        lastTour.getTourNodes().sort((nodeArr1, nodeArr2) => {
            if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
            if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
            return 0;
        })[2][1],
    ).toEqual(409);
    expect(
        lastTour.getTourNodes().sort((nodeArr1, nodeArr2) => {
            if (nodeArr1[0].getNodeID() > nodeArr2[0].getNodeID()) return 1;
            if (nodeArr1[0].getNodeID() < nodeArr2[0].getNodeID()) return -1;
            return 0;
        })[2][2],
    ).toEqual(3);
});

test('Create Tour works properly', async () => {
    const nodes: MapNode[] = await MapNode.getNodesObjects('fribourg');
    nodes.sort((node1, node2) => {
        if (node1.getNodeID() > node2.getNodeID()) return 1;
        if (node1.getNodeID() < node2.getNodeID()) return -1;
        return 0;
    });

    const timing: Date = new Date(2005, 4, 27, 7, 59, 1);

    const tourNodes: [MapNode, number, number][] = [
        [nodes[0], 687, 1],
        [nodes[1], 456, 2],
        [nodes[2], 569, 3],
    ];

    const tour: Tour = await Tour.createTour('fribourg', timing, new Date(2007, 5, 11, 3, 25, 11), 567, 879, tourNodes);

    expect(tour.getTourTiming()).toEqual(new Date(2005, 4, 27, 7, 59, 1));
    expect(tour.getTourTime()).toEqual(567);
    expect(tour.getTourWaste()).toEqual(879);
    expect(tour.getTourNodes()).toEqual(tourNodes);

    const timingToString = `${timing.getFullYear()}-${
        timing.getMonth() + 1
    }-${timing.getDate()} ${timing.getHours()}:${timing.getMinutes()}:${timing.getSeconds()}.${timing.getMilliseconds()}`;

    const tourQuery: Record<string, string | number | boolean | Date>[] = await HelperFunctions.querying(
        `SELECT * FROM fribourg.tours
        WHERE timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS')`,
        client,
    );
    expect(tourQuery).toContainEqual({
        timing: timing,
        timingresult: new Date(2007, 5, 11, 3, 25, 11),
        tourtime: 567,
        tourwaste: 879,
    });

    //query and test for tour_nodes
    const tourNodesQuery: Record<string, string | number | boolean | Date>[] = await HelperFunctions.querying(
        `SELECT * FROM fribourg.tour_nodes
        WHERE tourtiming = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS')`,
        client,
    );
    expect(tourNodesQuery).toContainEqual({
        nodeid: 1,
        tourtiming: timing,
        wastecollected: 687,
        ordering: 1,
    });
    expect(tourNodesQuery).toContainEqual({
        nodeid: 2,
        tourtiming: timing,
        wastecollected: 456,
        ordering: 2,
    });
    expect(tourNodesQuery).toContainEqual({
        nodeid: 3,
        tourtiming: timing,
        wastecollected: 569,
        ordering: 3,
    });
});
