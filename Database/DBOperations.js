//Load file system package (read/write files)
const fs = require('fs');
//Load package to execute bash files
const exec = require('child_process').exec;
//Load dotenv environment variables. Need to supply the file path to the .env file
require('dotenv').config({path: '../.env'});
const env = process.env;

async function createProjectSQLFiles(setupSQLTemplateRelPath, deleteSQLTemplateRelPath, projectname){
    //setup paths
    setupSQLTemplateAbsPath = env.PROJECT_ROOT_PATH + setupSQLTemplateRelPath;
    deleteSQLTemplateAbsPath = env.PROJECT_ROOT_PATH + deleteSQLTemplateRelPath;
    //2 steps: create setupProjectXXX.sql file and then deleteProjectXXX.sql file
    //step 1:
    //save path to template file without filename for later use
    let dirOfSetupSQLTemplate = setupSQLTemplateAbsPath.split('/').slice(0, -1).join('/');
    //read sql-Template file
    let sqlFileCreateProject = await new Promise((resolve, reject) => {
        fs.readFile(setupSQLTemplateAbsPath, 'utf8', function (err,sql) {
            if (err) {
                console.log(err);
                reject();
            }
            resolve(sql);
        });
    });
    //replace "REPLACEWITHPROJECTNAME" with projectname
    sqlFileCreateProject = sqlFileCreateProject.split("REPLACEWITHPROJECTNAME").join(projectname);
    //write createProjectXXX.sql File
    await new Promise((resolve, reject) => {
        fs.writeFile(dirOfSetupSQLTemplate + '/setupProject' + projectname + '.sql', sqlFileCreateProject, function(err) {
            if(err) {
                reject();
            } else{
                resolve();
            }
        }); 
    });
    //step 2:
    //save path to template file without filename for later use
    let dirOfDeleteSQLTemplate = deleteSQLTemplateAbsPath.split('/').slice(0, -1).join('/');
    //read sql-Template file
    let sqlFileDeleteProject = await new Promise((resolve, reject) => {
        fs.readFile(deleteSQLTemplateAbsPath, 'utf8', function (err,sql) {
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
    await new Promise((resolve, reject) => {
        fs.writeFile(dirOfDeleteSQLTemplate + '/deleteProject' + projectname + '.sql', sqlFileDeleteProject, function(err) {
            if(err) {
                reject();
            } else{
                resolve();
            }
        }); 
    });
}

//Pass the relative path of the sql-file to be executed as string parameter
async function DBOperation(relSQLFilePath){
    absSQLFilePath = env.PROJECT_ROOT_PATH + relSQLFilePath;
    await new Promise((resolve, reject) => {
        exec(`${env.PROJECT_ROOT_PATH}/./Database/SQLQueryToDB.bash ${env.DB_NAME} ${env.DB_USER} ${env.DB_PASSWORD} ${env.DB_HOST} ${env.DB_PORT} ${absSQLFilePath}`,
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
            });
    });
}

async function initialSetupDB(){
    await DBOperation('./Database/setupDB.sql');
}

async function deleteInitialDB(){
    await DBOperation('./Database/deleteDB.sql');
}

async function setupNewProjectDB(projectname){
    await createProjectSQLFiles('./Database/setupProject/setupProjectTemplate.sql', './Database/deleteProject/deleteProjectTemplate.sql', projectname);
    await DBOperation('./Database/setupProject/setupProject' + projectname + '.sql');
}

async function deleteProject(projectname){
    await DBOperation('./Database/deleteProject/deleteProject' + projectname + '.sql');
    //delete sql files of project
}

//createProjectSQLFiles('./Database/setupProject/setupProjectTemplate.sql', './Database/deleteProject/deleteProjectTemplate.sql', 'Bern');
/*DBOperation('./Database/setupDB.sql').then(() => {
    DBOperation('./Database/deleteDB.sql');
});*/
//setupNewProjectDB('Fribourg');
//deleteProject('Fribourg');
