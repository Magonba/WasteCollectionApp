//This File has a .test.ts extension in order to be ignored by the compiler (otherwise would need to modify some config file)
//Modify the corresponding config file at a later stage in the project

import { exec } from 'child_process';
import { Logger } from '../Logger/Logger';
import dotenv from 'dotenv';
import * as fs from 'fs';
import { Client } from 'pg';
dotenv.config(); // necessary for accessing process.env variable

test('This is a Helper File. The result of this test suite will always be OK according to Jest.', async () => {
    expect(0).toBe(0);
});

export async function deleteProject(deleteSQLTemplateRelPath: string, projectname: string): Promise<void> {
    //save path to template file without filename for later use
    const deleteSQLTemplateAbsPath = process.env.PROJECT_ROOT_PATH + deleteSQLTemplateRelPath;
    const dirOfDeleteSQLTemplate = deleteSQLTemplateAbsPath.split('/').slice(0, -1).join('/');
    //read sql-Template file
    let sqlFileDeleteProject = await new Promise<string>((resolve, reject) => {
        fs.readFile(deleteSQLTemplateAbsPath, 'utf8', (err: Error | null, sql: string) => {
            if (err) {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                reject(err);
            }
            resolve(sql);
        });
    });
    //replace "REPLACEWITHPROJECTNAME" with projectname
    sqlFileDeleteProject = sqlFileDeleteProject.split('REPLACEWITHPROJECTNAME').join(projectname);
    //write deleteProjectXXX.sql File
    await new Promise<void>((resolve, reject) => {
        fs.writeFile(
            dirOfDeleteSQLTemplate + '/deleteProject' + projectname + '.sql',
            sqlFileDeleteProject,
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
    await DBOperation(dirOfDeleteSQLTemplate + '/deleteProject' + projectname + '.sql');
}

//Pass the relative path of the sql-file to be executed as string parameter
async function DBOperation(absSQLFilePath: string) {
    await new Promise<void>((resolve, reject) => {
        exec(
            `${process.env.PROJECT_ROOT_PATH}/backend/Database/SQLQueryToDB.bash ${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST} ${process.env.DB_PORT} ${absSQLFilePath}`,
            (err: Error | null, stdout: string | null, stderr: string | null) => {
                if (stdout !== null && stdout !== '') {
                    Logger.getLogger().dbLog(stdout, 'silly');
                }
                if (stderr !== null && stderr != '') {
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

export async function deleteFile(relfilepath: string): Promise<void> {
    const absfilepath = process.env.PROJECT_ROOT_PATH + relfilepath;
    await new Promise<void>((resolve, reject) => {
        exec(`rm ${absfilepath}`, (err: Error | null, stdout: string | null, stderr: string | null) => {
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
        });
    });
}

export async function querying(
    myQueryString: string,
    client: Client,
): Promise<Record<string, string | number | boolean | Date>[]> {
    return await new Promise<Record<string, string | number | boolean | Date>[]>((resolve, reject) => {
        client.query(myQueryString, (err: Error, res) => {
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
