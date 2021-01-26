import { DatabaseHandler } from "../Database/DatabaseHandler";
import { Client } from "pg";
import { exec } from "child_process";
import dotenv from "dotenv";
dotenv.config(); // necessary for accessing process.env variable
let client: Client;

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

test("DatabaseHandler is a Class/Function", () => {
    const isClassOrFunction = DatabaseHandler instanceof Function;
    expect(isClassOrFunction).toBe(true);
});

describe("DatabaseHandler Setup Tests", () => {
    afterEach(async () => {
        //execute a SQL script for deleting the created setup tables and schema
        await new Promise((resolve, reject) => {
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
                    resolve("Successfully deleted setup tables and schema");
                }
            );
        }).catch((err) => {
            console.error(err);
            console.error("Issues deleting setup tables and schema!");
        });
    });

    test("Starting DatabaseHandler sets the database with usersprojects schema up", async () => {
        //start DatabaseHandler
        const dbHandler = new DatabaseHandler();
        
        //query the db for the new schema 'usersprojects'
        await new Promise((resolve, reject) => {
            client.query(`SELECT schema_name FROM information_schema.schemata
            WHERE schema_name = \'usersprojects\'`,
            (err, res) => {
                if(err){
                    reject(err);
                } else {
                    expect(res.rows).toContainEqual({ schema_name: 'usersprojects' });
                    resolve(res.rows);
                }
            })
        }).catch((err) => {
            console.error(err);
            fail(new Error("Error querying the database"))
        });
    });

    test("Starting DatabaseHandler sets the database with the tables users, projects and userprojects up (from schema usersprojects)", async () => {
        //start DatabaseHandler
        const dbHandler = new DatabaseHandler();
        
        //query the db for the new tables
        await new Promise((resolve, reject) => {
            client.query(`SELECT table_name FROM information_schema.tables 
            WHERE table_schema = \'public\'`,
            (err, res) => {
                if(err){
                    reject(err);
                } else {
                    expect(res.rows).toContainEqual({ table_name: 'users' });
                    expect(res.rows).toContainEqual({ table_name: 'projects' });
                    expect(res.rows).toContainEqual({ table_name: 'userprojects' });
                    resolve(res.rows);
                }
            })
        }).catch((err) => {
            console.error(err);
            fail(new Error("Error querying the database"));
        });
    })
});
