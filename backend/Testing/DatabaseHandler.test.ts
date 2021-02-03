import { DatabaseHandler } from "../Database/DatabaseHandler";
import { Client } from "pg";
import { exec } from "child_process";
import dotenv from "dotenv";
import { deleteProject, deleteFile } from "./HelperFunctions.test";
dotenv.config(); // necessary for accessing process.env variable
let client: Client; // for psql db queries

beforeAll(async () => {
    //start PSQL server
    console.log("You might need to start the Postgresql server with the command \'sudo service postgresql start\' if you get an ECONNREFUSED Error");

    //setup pg client connection
    client = new Client({
        connectionString: "postgresql://wastecollectiondata:wastecollectiondata@localhost:5432/wastecollectiondata" // postgresql://user:password@server:portnb/dbname
    })
    await client.connect();
});

afterAll(() => {
    //end pg client connection
    client.end();
});

afterEach(async () => {
    //execute a SQL script for deleting the created setup tables and schema (script also works if no tables were created)
    await new Promise<void>((resolve, reject) => {
        exec(`${process.env.PROJECT_ROOT_PATH}/backend/Database/SQLQueryToDB.bash ${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST} ${process.env.DB_PORT} ${process.env.PROJECT_ROOT_PATH}/backend/Database/deleteDB.sql`,
            (error, stdout, stderr) => {
                if (stdout !== null){
                    process.stdout.write('stdout: ' + stdout);
                }
                else if (stderr !== null){
                    process.stderr.write('stderr' + stderr);
                }
                if (error !== null) {
                    reject(error);
                }
                resolve();
            }
        );
    }).catch((err) => {
        console.error(err);
        console.error("Issues deleting setup tables and schema!");
    });
});

test("DatabaseHandler is a Class/Function", () => {
    const isClassOrFunction = DatabaseHandler instanceof Function;
    expect(isClassOrFunction).toBe(true);
});

describe("DatabaseHandler Setup Tests", () => {
    test("Starting DatabaseHandler sets the database with usersprojects schema up", async () => {
        //start DatabaseHandler
        const dbHandler = await DatabaseHandler.setupDatabaseHandler();
        
        //query the db for the new schema 'usersprojects'
        await new Promise<void>((resolve, reject) => {
            client.query(`SELECT schema_name FROM information_schema.schemata
            WHERE schema_name = \'usersprojects\'`,
            (err, res) => {
                if(err){
                    reject(err);
                } else {
                    expect(res.rows).toContainEqual({ schema_name: 'usersprojects' });
                    resolve();
                }
            })
        }).catch((err) => {
            console.error(err);
            fail(new Error("Error querying the database"))
        });

        //endClient for proper teardown
        await dbHandler.endClient();
    });

    test("Starting DatabaseHandler sets the database with the tables users, projects and userprojects up (from schema usersprojects)", async () => {
        //start DatabaseHandler
        const dbHandler = await DatabaseHandler.setupDatabaseHandler();
        
        //query the db for the new tables
        await new Promise<void>((resolve, reject) => {
            client.query(`SELECT table_name FROM information_schema.tables 
            WHERE table_schema = \'usersprojects\'`,
            (err, res) => {
                if(err){
                    reject(err);
                } else {
                    expect(res.rows).toContainEqual({ table_name: 'users' });
                    expect(res.rows).toContainEqual({ table_name: 'projects' });
                    expect(res.rows).toContainEqual({ table_name: 'userprojects' });
                    resolve();
                }
            })
        }).catch((err) => {
            console.error(err);
            fail(new Error("Error querying the database"));
        });

        //endClient for proper teardown
        await dbHandler.endClient();
    })
});

describe("DatabaseHandler queries work", () => {
    test("Query function works with select statement", async () => {
        //start DatabaseHandler
        const dbHandler = await DatabaseHandler.setupDatabaseHandler();

        expect(await dbHandler.querying(`SELECT schema_name FROM information_schema.schemata
        WHERE schema_name = \'usersprojects\'`)).toEqual([{ schema_name: 'usersprojects' }]);

        //endClient for proper teardown
        await dbHandler.endClient();
    });

    test("Query function works with insert statement", async () => {
        //start DatabaseHandler
        const dbHandler = await DatabaseHandler.setupDatabaseHandler();

        expect(await dbHandler.querying(`INSERT INTO usersprojects.projects (projectname)
        VALUES (\'Fribourg2020\')`)).toEqual([]);

        //endClient for proper teardown
        await dbHandler.endClient();
    });
});

describe("Project creation/deletion works", () => {
    test("Create Project", async () => {
        //start DatabaseHandler
        const dbHandler = await DatabaseHandler.setupDatabaseHandler();

        //create project
        await dbHandler.setupProject("Fribourg");

        //query the db for the new schema 'fribourg'
        await new Promise<void>((resolve, reject) => {
            client.query(`SELECT schema_name FROM information_schema.schemata
            WHERE schema_name = \'fribourg\'`,
            (err, res) => {
                if(err){
                    reject(err);
                } else {
                    expect(res.rows).toContainEqual({ schema_name: 'fribourg' });
                    resolve();
                }
            })
        }).catch((err) => {
            console.error(err);
            fail(new Error("Error querying the database"))
        });

        //query the db for the new tables
        await new Promise<void>((resolve, reject) => {
            client.query(`SELECT table_name FROM information_schema.tables 
            WHERE table_schema = \'fribourg\'`,
            (err, res) => {
                if(err){
                    reject(err);
                } else {
                    expect(res.rows).toContainEqual({ table_name: 'nodes' });
                    expect(res.rows).toContainEqual({ table_name: 'arcs' });
                    expect(res.rows).toContainEqual({ table_name: 'garbagescenarios' });
                    expect(res.rows).toContainEqual({ table_name: 'garbagescenarioversions' });
                    expect(res.rows).toContainEqual({ table_name: 'garbagescenarioversions_nodes_waste' });
                    expect(res.rows).toContainEqual({ table_name: 'collectionpointscenarios' });
                    expect(res.rows).toContainEqual({ table_name: 'collectionpointscenarioversions' });
                    expect(res.rows).toContainEqual({ table_name: 'collectionpointscenarioversions_nodes_potcp' });
                    expect(res.rows).toContainEqual({ table_name: 'vehicletypes' });
                    expect(res.rows).toContainEqual({ table_name: 'vehicletypeversions' });
                    expect(res.rows).toContainEqual({ table_name: 'vehicletypeversions_nodes_activatedarcs' });
                    expect(res.rows).toContainEqual({ table_name: 'results' });
                    expect(res.rows).toContainEqual({ table_name: 'resultsvehicles' });
                    expect(res.rows).toContainEqual({ table_name: 'tours' });
                    expect(res.rows).toContainEqual({ table_name: 'tour_nodes' });
                    resolve();
                }
            })
        }).catch((err) => {
            console.error(err);
            fail(new Error("Error querying the database"));
        });

        await deleteProject("./backend/Database/deleteProject/deleteProjectTemplate.sql", "Fribourg");
        await deleteFile("./backend/Database/deleteProject/deleteProjectFribourg.sql");
        await deleteFile("./backend/Database/setupProject/setupProjectFribourg.sql");

        //endClient for proper teardown
        await dbHandler.endClient();
    });

    test("Delete Project", async () => {
        //start DatabaseHandler
        const dbHandler = await DatabaseHandler.setupDatabaseHandler();

        //create project
        await dbHandler.setupProject("Fribourg");

        //delete project
        await dbHandler.deleteProject("Fribourg");

        //query the db for the schema 'fribourg' (which should not exist anymore)
        await new Promise<void>((resolve, reject) => {
            client.query(`SELECT schema_name FROM information_schema.schemata
            WHERE schema_name = \'fribourg\'`,
            (err, res) => {
                if(err){
                    reject(err);
                } else {
                    expect(res.rows).toEqual([]);
                    resolve();
                }
            })
        }).catch((err) => {
            console.error(err);
            fail(new Error("Error querying the database"))
        });

        //query the db for the tables (which should not exist anymore)
        await new Promise<void>((resolve, reject) => {
            client.query(`SELECT table_name FROM information_schema.tables 
            WHERE table_schema = \'fribourg\'`,
            (err, res) => {
                if(err){
                    reject(err);
                } else {
                    expect(res.rows).toEqual([]);
                    resolve();
                }
            })
        }).catch((err) => {
            console.error(err);
            fail(new Error("Error querying the database"));
        });

        //endClient for proper teardown
        await dbHandler.endClient();
    });
});
