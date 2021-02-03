//This File has a .test.ts extension in order to be ignored by the compiler (otherwise would need to modify some config file)
//Modify the corresponding config file at a later stage in the project

import { exec } from "child_process";
import dotenv from "dotenv";
import * as fs from 'fs';
import { Client } from "pg";
dotenv.config(); // necessary for accessing process.env variable

test("This is a Helper File", () => {
    expect(0).toBe(0);
});

export async function deleteProject(deleteSQLTemplateRelPath: string, projectname: string){
    //save path to template file without filename for later use
    let deleteSQLTemplateAbsPath = process.env.PROJECT_ROOT_PATH + deleteSQLTemplateRelPath;
    let dirOfDeleteSQLTemplate = deleteSQLTemplateAbsPath.split('/').slice(0, -1).join('/');
    //read sql-Template file
    let sqlFileDeleteProject = await new Promise<string>((resolve, reject) => {
        fs.readFile(deleteSQLTemplateAbsPath, 'utf8', function (err: any, sql: string) {
            if (err) {
                console.log(err);
                reject();
            }
            resolve(sql);
        });
    });
    //replace "REPLACEWITHPROJECTNAME" with projectname
    sqlFileDeleteProject = sqlFileDeleteProject.split("REPLACEWITHPROJECTNAME").join(projectname);
    //write deleteProjectXXX.sql File
    await new Promise<void>((resolve, reject) => {
        fs.writeFile(dirOfDeleteSQLTemplate + '/deleteProject' + projectname + '.sql', sqlFileDeleteProject, function(err: any) {
            if(err) {
                reject();
            } else{
                resolve();
            }
        }); 
    });
    await DBOperation(dirOfDeleteSQLTemplate + '/deleteProject' + projectname + '.sql');
}

//Pass the relative path of the sql-file to be executed as string parameter
async function DBOperation(absSQLFilePath: string){
    await new Promise<void>((resolve) => {
        exec(`${process.env.PROJECT_ROOT_PATH}/backend/Database/SQLQueryToDB.bash ${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST} ${process.env.DB_PORT} ${absSQLFilePath}`,
            function (error, stdout, stderr) {
                if (stdout !== null){
                    process.stdout.write('stdout: ' + stdout);
                }
                else if (stderr !== null){
                    process.stderr.write('stderr' + stderr);
                }
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
                resolve();
            }
        );
    });
}

export async function deleteFile(relfilepath : string) {
    let absfilepath = process.env.PROJECT_ROOT_PATH + relfilepath;
    await new Promise<void>((resolve, reject) => {
        exec(`rm ${absfilepath}`,
            function (error, stdout, stderr) {
                if (stdout !== null){
                    process.stdout.write('stdout: ' + stdout);
                }
                else if (stderr !== null){
                    process.stderr.write('stderr' + stderr);
                }
                if (error !== null) {
                    console.error('exec error: ' + error);
                }
                resolve();
            }
        );
    });
}

export async function querying(myQueryString : string, client : Client){
    return await new Promise<any[]>((resolve, reject) => {
        client.query(myQueryString,
        (err, res) => {
            if(err){
                reject(err);
            } else {
                resolve(res.rows);
            }
        })
    }).catch((err) => {
        console.error(err);
        fail(new Error("Error querying the database"))
    });
}
