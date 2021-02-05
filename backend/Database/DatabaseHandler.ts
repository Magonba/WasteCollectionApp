import { exec } from 'child_process';
import { Client, Pool } from 'pg';
import * as fs from 'fs';
import dotenv from 'dotenv';
dotenv.config(); // necessary for accessing process.env variable

//Singleton
export class DatabaseHandler {
    //construct dbHandler
    private static dbHandler: DatabaseHandler = new DatabaseHandler();

    //control variable to check if pool has not been ended (with pool.end())
    private poolUp = true;

    private pool: Pool = new Pool({
        connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, // postgresql://user:password@server:portnb/dbname
        max: 10,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 2000,
    });

    //Private constructor since async constructors are not supported in Typescript. Using Factory Method instead
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    //FactoryMethod of DatabaseHandler
    public static async getDatabaseHandler(client: Client): Promise<DatabaseHandler> {
        if (DatabaseHandler.dbHandler.poolUp === false) {
            //setup new pool
            DatabaseHandler.dbHandler.pool = new Pool({
                connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
                max: 10,
                idleTimeoutMillis: 10000,
                connectionTimeoutMillis: 2000,
            });
            //pool is now up
            DatabaseHandler.dbHandler.poolUp = true;
            //setup Database
            await DatabaseHandler.dbHandler.execSQLScript('./backend/Database/setupDB.sql');
        }
        //console.log('Test');
        /*const client = new Client({
            connectionString: 'postgresql://wastecollectiondata:wastecollectiondata@localhost:5432/wastecollectiondata', // postgresql://user:password@server:portnb/dbname
        });
        const test = await new Promise<JSON[]>((resolve, reject) => {
            console.log('Test2');
            client.query(
                `SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'usersprojects'`,
                (err: Error, res) => {
                    console.log('Test3');
                    if (err) {
                        console.error(err.stack);
                        reject(err);
                    } else {
                        resolve(res.rows);
                    }
                },
            );
        });
        console.log('test: ');
        console.log(test);
        client.end();*/
        const test2 = await DatabaseHandler.dbHandler.querying(`SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'usersprojects'`);
        console.log('test2: ');
        console.log(test2);

        //return static (private) dbHandler
        return DatabaseHandler.dbHandler;
    }

    public async endPool(): Promise<void> {
        await this.pool.end();
        this.poolUp = false;
    }

    public async querying(queryString: string): Promise<JSON[]> {
        return await new Promise<JSON[]>((resolve, reject) => {
            this.pool.query(queryString, (err: Error, res) => {
                if (err) {
                    console.error(queryString + ' &&&&& ' + err.stack);
                    reject(err);
                } else {
                    //console.log('res.rows: ' + res.rows + 'typeof: ' + typeof res);
                    resolve(res.rows);
                }
            });
        });
    }

    public async setupProject(projectname: string): Promise<void> {
        await this.setupOrDeleteProject(projectname, 'setup');
    }

    public async deleteProject(projectname: string): Promise<void> {
        await this.setupOrDeleteProject(projectname, 'delete');
    }

    private async setupOrDeleteProject(projectname: string, setupOrDelete: string): Promise<void> {
        //exit if createOrDelete variable is neither 'create' or 'delete'
        if (setupOrDelete !== 'setup' && setupOrDelete !== 'delete') {
            console.error(
                "String variable setupOrDelete of the function setupOrDeleteProject() has to be either 'setup' or 'delete'",
            );
            return Promise.reject(
                "String variable setupOrDelete of the function setupOrDeleteProject() has to be either 'setup' or 'delete'",
            );
        }

        //path to Template File
        const SQLTemplateRelPath: string =
            setupOrDelete === 'setup'
                ? `${process.env.SETUP_SQLTEMPLATE_RELPATH}`
                : `${process.env.DELETE_SQLTEMPLATE_RELPATH}`;
        const SQLTemplateAbsPath = `${process.env.PROJECT_ROOT_PATH}${SQLTemplateRelPath}`;

        //save path to template file without filename for later use
        const dirOfSQLTemplate = SQLTemplateAbsPath.split('/').slice(0, -1).join('/');

        //read sql-Template file
        let SQLTemplateFileProject = await new Promise<string>((resolve, reject) => {
            fs.readFile(SQLTemplateAbsPath, 'utf8', (err: Error | null, sql: string) => {
                if (err) {
                    console.error(err.stack);
                    reject(err);
                } else {
                    resolve(sql);
                }
            });
        });

        //replace "REPLACEWITHPROJECTNAME" with projectname
        SQLTemplateFileProject = SQLTemplateFileProject.split('REPLACEWITHPROJECTNAME').join(projectname);

        //write setupProjectXXX.sql or deleteProjectXXX.sql file
        await new Promise<void>((resolve, reject) => {
            fs.writeFile(
                `${dirOfSQLTemplate}/${setupOrDelete}Project${projectname}.sql`,
                SQLTemplateFileProject,
                (err: Error | null) => {
                    if (err) {
                        console.error(err.stack);
                        reject(err);
                    } else {
                        resolve();
                    }
                },
            );
        });

        //execute setupProjectXXX.sql or deleteProjectXXX.sql script
        if (setupOrDelete === 'setup') {
            await this.execSQLScript(`${process.env.SETUP_PROJECT_RELPATH}setupProject${projectname}.sql`);
        } else {
            await this.execSQLScript(`${process.env.DELETE_PROJECT_RELPATH}deleteProject${projectname}.sql`);
        }

        //delete setup and delete files of project in case of project deletion
        if (setupOrDelete === 'delete') {
            await new Promise<void>((resolve, reject) => {
                exec(
                    `rm ${process.env.SETUP_PROJECT_RELPATH}setupProject${projectname}.sql ${process.env.DELETE_PROJECT_RELPATH}deleteProject${projectname}.sql`,
                    (err, stdout, stderr) => {
                        if (stdout !== null && stdout !== '') {
                            //process.stdout.write('stdout: ' + stdout);
                            //console.log("stdout is '" + stdout + "'");
                        }
                        if (stderr !== null && stderr !== '') {
                            //process.stderr.write('stderr: ' + stderr);
                            //console.error('stderr: ' + stderr);
                        }
                        if (err !== null) {
                            //console.error('exec error: ' + err.stack);
                            reject(err);
                        }
                        resolve();
                    },
                );
            });
        }
    }

    private async execSQLScript(relSQLFilePath: string) {
        const absSQLFilePath = process.env.PROJECT_ROOT_PATH + relSQLFilePath;
        await new Promise<void>((resolve, reject) => {
            exec(
                `${process.env.PROJECT_ROOT_PATH}/backend/Database/SQLQueryToDB.bash ${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST} ${process.env.DB_PORT} ${absSQLFilePath}`,
                function (err, stdout, stderr) {
                    if (stdout !== null && stdout !== '') {
                        //process.stdout.write('stdout: ' + stdout);
                        //console.log("stdout is '" + stdout + "'");
                    }
                    if (stderr !== null && stderr !== '') {
                        //process.stderr.write('stderr' + stderr);
                        //console.error("stderr is '" + stderr + "'");
                    }
                    if (err !== null) {
                        //console.error('exec error: ' + err.stack);
                        reject(err);
                    }
                    resolve();
                },
            );
        });
    }
}
