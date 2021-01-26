import { DatabaseHandler } from "../Database/DatabaseHandler";
import { Client } from "pg";
import { exec } from "child_process";
import { config } from "dotenv";
config({path: '../../.env'});
const env = process.env;
//move creation of pg client to beforeAll() and do a afterEach() for deletion of created tables

describe("DatabaseHandler Tests", () => {
    beforeAll(async () => {
        await new Promise((resolve, reject) => {
            exec(`sudo service postgresql start`,
                function (error, stdout, stderr) {
                    if (stdout !== null){
                        process.stdout.write('stdout: ' + stdout);
                        resolve(stdout);
                    }
                    else if (stderr !== null){
                        process.stderr.write('stderr' + stderr);
                        resolve(stderr);
                    }
                    if (error !== null) {
                        console.log('exec error: ' + error);
                        resolve(error);
                    }
                });
        });
    });

    test("DatabaseHandler is a Class/Function", () => {
        const isClassOrFunction = DatabaseHandler instanceof Function;
        expect(isClassOrFunction).toBe(true);
    });

    test("Starting DatabaseHandler sets the database with usersprojects schema up", async () => {
        //setup connection to DB
        const client = new Client({
            connectionString: "postgresql://wastecollectiondata:wastecollectiondata@localhost:5432/wastecollectiondata" // postgresql://user:password@server:portnb/dbname
        })
        await client.connect();

        //start DatabaseHandler
        const dbHandler = new DatabaseHandler();
        
        try {
            //query the db for the new schema 'usersprojects'
            await new Promise((resolve, reject) => {
                client.query(`SELECT schema_name FROM information_schema.schemata
                WHERE schema_name = \'usersprojects\'`,
                (err, res) => {
                    if(err){
                        reject(err);
                    } else {
                        client.end();
                        expect(res.rows).toContainEqual({ schema_name: 'usersprojects' });
                        resolve(res.rows);
                    }
                })
            });
        } catch (error) {
            await client.end();
            console.log(error);
            fail(new Error("Error querying the database"));
        }
    })

    test("Starting DatabaseHandler sets the database with the tables users, projects and userprojects up (from schema usersprojects)", async () => {
        //setup connection to DB
        const client = new Client({
            connectionString: "postgresql://wastecollectiondata:wastecollectiondata@localhost:5432/wastecollectiondata" // postgresql://user:password@server:portnb/dbname
        })
        await client.connect();

        //start DatabaseHandler
        const dbHandler = new DatabaseHandler();
        
        try {
            //query the db for the new tables
            await new Promise((resolve, reject) => {
                client.query(`SELECT table_name FROM information_schema.tables 
                WHERE table_schema = \'public\'`,
                (err, res) => {
                    if(err){
                        reject(err);
                    } else {
                        client.end();
                        console.log(res.rows);
                        expect(res.rows).toContainEqual({ table_name: 'users' });
                        expect(res.rows).toContainEqual({ table_name: 'projects' });
                        expect(res.rows).toContainEqual({ table_name: 'userprojects' });
                        resolve(res.rows);
                    }
                })
            });
        } catch (error) {
            await client.end();
            console.log(error);
            fail(new Error("Error querying the database"));
        }
    })
});
