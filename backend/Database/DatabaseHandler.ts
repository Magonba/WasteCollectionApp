import { exec } from "child_process";
import { Client } from "pg";
import * as fs from 'fs';
import dotenv from "dotenv";
dotenv.config(); // necessary for accessing process.env variable

export class DatabaseHandler {

    private client: Client;

    //Private constructor since async constructors are not supported in Typescript. Using Factory Method instead
    private constructor(){
        //assign new Client(...) to client variable (must be in constructor otherwise typescript will display an error message since a variable of type Client was not initialized (which means it is potentially of type undefined so we can't call functions of type Client on it))
        this.client = new Client({
            connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}` // postgresql://user:password@server:portnb/dbname
        })
    }

    //FactoryMethod of DatabaseHandler
    public static async setupDatabaseHandler(){
        //construct dbHandler
        const dbHandler = new DatabaseHandler();
        //setup postgresql client connection
        await dbHandler.client.connect();
        //setup Database
        await dbHandler.execSQLScript("./backend/Database/setupDB.sql");
        //return dbHandler
        return dbHandler;
    }

    public async endClient(){
        await this.client.end();
    }

    public async connectClient(){
        await this.client.connect();
    }

    public async querying(queryString : string) {
        return await new Promise<any[]>((resolve, reject) => {
            this.client.query(queryString,
            (err, res) => {
                if(err){
                    reject(err);
                } else {
                    resolve(res.rows);
                }
            })
        }).catch((err) => {
            console.error(err);
            fail(new Error("Error querying the database"));
        });
    }

    public async setupProject(projectname : string) : Promise<void> {
        await this.setupOrDeleteProject(projectname, "setup");
    }

    public async deleteProject(projectname : string) : Promise<void> {
        await this.setupOrDeleteProject(projectname, "delete");
    }

    private async setupOrDeleteProject(projectname : string, setupOrDelete : string) : Promise<void> {
        //exit if createOrDelete variable is neither 'create' or 'delete'
        if(setupOrDelete !== "setup" && setupOrDelete !== "delete"){
            console.error("String variable setupOrDelete of the function setupOrDeleteProject() has to be either \'setup\' or \'delete\'");
            return;
        }

        //path to Template File
        let SQLTemplateRelPath : string = setupOrDelete === "setup" ? `${process.env.SETUP_SQLTEMPLATE_RELPATH}` : `${process.env.DELETE_SQLTEMPLATE_RELPATH}`;
        let SQLTemplateAbsPath : string = `${process.env.PROJECT_ROOT_PATH}${SQLTemplateRelPath}`;

        //save path to template file without filename for later use
        let dirOfSQLTemplate = SQLTemplateAbsPath.split('/').slice(0, -1).join('/');

        //read sql-Template file
        let SQLTemplateFileProject : string = "";
        try {
            SQLTemplateFileProject = await new Promise<string>((resolve, reject) => {
                fs.readFile(SQLTemplateAbsPath, 'utf8', function (err,sql) {
                    if (err) {
                        console.error(err);
                        reject();
                    } else {
                        resolve(sql);
                    }
                });
            });
        } catch (err) {
            return;
        }

        //replace "REPLACEWITHPROJECTNAME" with projectname
        SQLTemplateFileProject = SQLTemplateFileProject.split("REPLACEWITHPROJECTNAME").join(projectname);

        //write setupProjectXXX.sql or deleteProjectXXX.sql file
        try {
            await new Promise<void>((resolve, reject) => {
                fs.writeFile(`${dirOfSQLTemplate}/${setupOrDelete}Project${projectname}.sql`, SQLTemplateFileProject, function(err) {
                    if(err) {
                        console.error(err);
                        reject();
                    } else{
                        resolve();
                    }
                }); 
            });
        } catch (error) {
            return;
        }

        //execute setupProjectXXX.sql or deleteProjectXXX.sql script
        if (setupOrDelete === "setup") {
            await this.execSQLScript(`${process.env.SETUP_PROJECT_RELPATH}setupProject${projectname}.sql`);
        } else {
            await this.execSQLScript(`${process.env.DELETE_PROJECT_RELPATH}deleteProject${projectname}.sql`);            
        }

        //delete setup and delete files of project in case of project deletion
        if (setupOrDelete === "delete"){
            await new Promise<void>((resolve, reject) => {
                exec(`rm ${process.env.SETUP_PROJECT_RELPATH}setupProject${projectname}.sql ${process.env.DELETE_PROJECT_RELPATH}deleteProject${projectname}.sql`,
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
    }

    private async execSQLScript(relSQLFilePath: string){
        const absSQLFilePath = process.env.PROJECT_ROOT_PATH + relSQLFilePath;
        await new Promise<void>((resolve, reject) => {
            exec(`${process.env.PROJECT_ROOT_PATH}/backend/Database/SQLQueryToDB.bash ${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST} ${process.env.DB_PORT} ${absSQLFilePath}`,
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
}