import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { Client } from 'pg';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import * as HelperFunctions from './HelperFunctions.test';
dotenv.config(); // necessary for accessing process.env variable
let client: Client; // for psql db queries

beforeAll(async () => {
    //start PSQL server
    Logger.getLogger().fileAndConsoleLog(
        "You might need to start the Postgresql server with the command 'sudo service postgresql start' if you get an ECONNREFUSED Error",
        'info',
    );

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

    //execute a SQL script for deleting the created setup tables and schema (script also works if no tables were created)
    await new Promise<void>((resolve, reject) => {
        exec(
            `${process.env.PROJECT_ROOT_PATH}/backend/Database/SQLQueryToDB.bash ${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST} ${process.env.DB_PORT} ${process.env.PROJECT_ROOT_PATH}/backend/Database/deleteDB.sql`,
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
    //execute a SQL script for deleting the created setup tables and schema (script also works if no tables were created)
    await new Promise<void>((resolve, reject) => {
        exec(
            `${process.env.PROJECT_ROOT_PATH}/backend/Database/SQLQueryToDB.bash ${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST} ${process.env.DB_PORT} ${process.env.PROJECT_ROOT_PATH}/backend/Database/deleteDB.sql`,
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

test('DatabaseHandler is a Class/Function', () => {
    const isClassOrFunction = DatabaseHandler instanceof Function;
    expect(isClassOrFunction).toBe(true);
});

describe('DatabaseHandler Setup Tests', () => {
    test('Starting DatabaseHandler sets the database with usersprojects schema up', async () => {
        //start DatabaseHandler
        await DatabaseHandler.getDatabaseHandler();

        //query the db for the new schema 'usersprojects'
        const schemaResult = await HelperFunctions.querying(
            `SELECT schema_name FROM information_schema.schemata
            WHERE schema_name = 'usersprojects'`,
            client,
        );
        expect(schemaResult).toContainEqual({ schema_name: 'usersprojects' });
    });

    test('Starting DatabaseHandler sets the database with the tables users, projects and userprojects up (from schema usersprojects)', async () => {
        //start DatabaseHandler
        await DatabaseHandler.getDatabaseHandler();

        //query the db for the new tables
        const tableResult = await HelperFunctions.querying(
            `SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'usersprojects'`,
            client,
        );
        expect(tableResult).toContainEqual({ table_name: 'users' });
        expect(tableResult).toContainEqual({ table_name: 'projects' });
        expect(tableResult).toContainEqual({ table_name: 'userprojects' });
    });
});

describe('DatabaseHandler queries work', () => {
    test('Query function works with select statement', async () => {
        //start DatabaseHandler
        const dbHandler = await DatabaseHandler.getDatabaseHandler();

        expect(
            await dbHandler.querying(`SELECT schema_name FROM information_schema.schemata
            WHERE schema_name = 'usersprojects'`),
        ).toEqual([{ schema_name: 'usersprojects' }]);
    });

    test('Query function works with insert statement', async () => {
        //start DatabaseHandler
        const dbHandler = await DatabaseHandler.getDatabaseHandler();

        expect(
            await dbHandler.querying(`INSERT INTO usersprojects.projects (projectname)
            VALUES ('Fribourg2020')`),
        ).toEqual([]);

        const projects = await HelperFunctions.querying(
            `SELECT projectname FROM usersprojects.projects 
            WHERE projectname = 'Fribourg2020'`,
            client,
        );

        expect(projects).toEqual([{ projectname: 'Fribourg2020' }]);
    });
});

describe('Project creation/deletion works', () => {
    test('Create Project', async () => {
        //start DatabaseHandler
        const dbHandler = await DatabaseHandler.getDatabaseHandler();

        //create project
        await dbHandler.setupProject('Fribourg');

        //query the db for the new schema 'fribourg'
        const schemaResult = await HelperFunctions.querying(
            `SELECT schema_name FROM information_schema.schemata
            WHERE schema_name = 'fribourg'`,
            client,
        );
        expect(schemaResult).toContainEqual({ schema_name: 'fribourg' });

        //query the db for the new tables
        const tableResult = await HelperFunctions.querying(
            `SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'fribourg'`,
            client,
        );
        expect(tableResult).toContainEqual({ table_name: 'nodes' });
        expect(tableResult).toContainEqual({ table_name: 'arcs' });
        expect(tableResult).toContainEqual({ table_name: 'garbagescenarios' });
        expect(tableResult).toContainEqual({ table_name: 'garbagescenarioversions' });
        expect(tableResult).toContainEqual({ table_name: 'garbagescenarioversions_nodes_waste' });
        expect(tableResult).toContainEqual({ table_name: 'collectionpointscenarios' });
        expect(tableResult).toContainEqual({ table_name: 'collectionpointscenarioversions' });
        expect(tableResult).toContainEqual({ table_name: 'collectionpointscenarioversions_nodes_potcp' });
        expect(tableResult).toContainEqual({ table_name: 'vehicletypes' });
        expect(tableResult).toContainEqual({ table_name: 'vehicletypeversions' });
        expect(tableResult).toContainEqual({ table_name: 'vehicletypeversions_nodes_activatedarcs' });
        expect(tableResult).toContainEqual({ table_name: 'results' });
        expect(tableResult).toContainEqual({ table_name: 'resultsvehicles' });
        expect(tableResult).toContainEqual({ table_name: 'tours' });
        expect(tableResult).toContainEqual({ table_name: 'tour_nodes' });

        await HelperFunctions.deleteProject('./backend/Database/deleteProject/deleteProjectTemplate.sql', 'Fribourg');
        await HelperFunctions.deleteFile('./backend/Database/deleteProject/deleteProjectFribourg.sql');
        await HelperFunctions.deleteFile('./backend/Database/setupProject/setupProjectFribourg.sql');
    });

    test('Delete Project', async () => {
        //start DatabaseHandler
        const dbHandler = await DatabaseHandler.getDatabaseHandler();

        //create project
        await dbHandler.setupProject('Fribourg');

        //delete project
        await dbHandler.deleteProject('Fribourg');

        //query the db for the schema 'fribourg' (which should not exist anymore)
        const schemaResult = await HelperFunctions.querying(
            `SELECT schema_name FROM information_schema.schemata
            WHERE schema_name = 'fribourg'`,
            client,
        );
        expect(schemaResult).toEqual([]);

        //query the db for the tables (which should not exist anymore)
        const tableResult = await HelperFunctions.querying(
            `SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'fribourg'`,
            client,
        );
        expect(tableResult).toEqual([]);
    });
});
