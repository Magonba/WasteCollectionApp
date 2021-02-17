import { exec } from 'child_process';
import { Logger } from '../Logger/Logger';
import { Pool } from 'pg';
import * as fs from 'fs';
import dotenv from 'dotenv';
import lodash from 'lodash';

dotenv.config({ path: '../../.env' }); // necessary for accessing process.env variable

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
    public static async getDatabaseHandler(): Promise<DatabaseHandler> {
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
        }

        //query the tables with schema usersprojects
        const setupTables: Record<
            string,
            string | number | boolean | Date
        >[] = await DatabaseHandler.dbHandler.querying(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'usersprojects'`,
        );

        //setup check variables (do the tables users, projects and userprojects exist?)
        const usersTable: boolean = setupTables.some((elem) => {
            return lodash.isEqual(elem, { table_name: 'users' });
        });
        const projectsTable: boolean = setupTables.some((elem) => {
            return lodash.isEqual(elem, { table_name: 'projects' });
        });
        const userprojectsTable: boolean = setupTables.some((elem) => {
            return lodash.isEqual(elem, { table_name: 'userprojects' });
        });

        //if one of those tables does not exist, run the setup sql script
        if (!usersTable || !projectsTable || !userprojectsTable) {
            await DatabaseHandler.dbHandler.execSQLScript('./backend/Database/setupDB.sql');
        }

        //return static (private) dbHandler
        return DatabaseHandler.dbHandler;
    }

    public async endPool(): Promise<void> {
        await this.pool.end();
        this.poolUp = false;
    }

    public async querying(queryString: string): Promise<Record<string, string | number | boolean | Date>[]> {
        return await new Promise<Record<string, string | number | boolean | Date>[]>((resolve, reject) => {
            this.pool.query(queryString, (err: Error, res) => {
                if (err) {
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                    reject(err);
                } else {
                    const myRecords: Record<string, string | number | boolean | Date>[] = [];
                    res.rows.forEach((obj) => {
                        const keys = Object.keys(obj);
                        const myRecord: Record<string, string | number | boolean | Date> = {};
                        keys.forEach((key) => {
                            switch (true) {
                                case obj[key] instanceof Date:
                                    myRecord[key] = <Date>obj[key];
                                    break;
                                case typeof obj[key] === 'string':
                                    myRecord[key] = <string>obj[key];
                                    break;
                                case typeof obj[key] === 'number':
                                    myRecord[key] = <number>obj[key];
                                    break;
                                case typeof obj[key] === 'boolean':
                                    myRecord[key] = <boolean>obj[key];
                                    break;
                                default:
                                    reject(Error('One of the properties was not (string | number | boolean | Date)!'));
                                    break;
                            }
                        });
                        myRecords.push(myRecord);
                    });
                    resolve(myRecords);
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
            Logger.getLogger().fileAndConsoleLog(
                "String variable setupOrDelete of the function setupOrDeleteProject() has to be either 'setup' or 'delete'",
                'error',
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
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
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
                        Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
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
        }
    }

    private async execSQLScript(relSQLFilePath: string) {
        const absSQLFilePath = process.env.PROJECT_ROOT_PATH + relSQLFilePath;
        await new Promise<void>((resolve, reject) => {
            exec(
                `${process.env.PROJECT_ROOT_PATH}/backend/Database/SQLQueryToDB.bash ${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST} ${process.env.DB_PORT} ${absSQLFilePath}`,
                function (err, stdout, stderr) {
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
    }
}
