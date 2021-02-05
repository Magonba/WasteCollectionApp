//This File has a .test.ts extension in order to be ignored by the compiler (otherwise would need to modify some config file)
//Modify the corresponding config file at a later stage in the project

import { exec } from 'child_process';
import dotenv from 'dotenv';
import * as fs from 'fs';
import { Client } from 'pg';
dotenv.config(); // necessary for accessing process.env variable

test.skip('This is a Helper File', () => {
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
                console.error(err.stack);
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
                    console.error(err.stack);
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
                    //process.stdout.write('stdout: ' + stdout);
                    //console.log("stdout is '" + stdout + "'");
                }
                if (stderr !== null && stderr != '') {
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

export async function deleteFile(relfilepath: string): Promise<void> {
    const absfilepath = process.env.PROJECT_ROOT_PATH + relfilepath;
    await new Promise<void>((resolve, reject) => {
        exec(`rm ${absfilepath}`, (err: Error | null, stdout: string | null, stderr: string | null) => {
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
        });
    });
}

export async function querying(myQueryString: string, client: Client): Promise<JSON[]> {
    return await new Promise<JSON[]>((resolve, reject) => {
        client.query(myQueryString, (err: Error, res) => {
            if (err) {
                console.error(err.stack);
                reject(err);
            } else {
                resolve(res.rows);
            }
        });
    });
}
