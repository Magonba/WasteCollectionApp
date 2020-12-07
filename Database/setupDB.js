const fs = require('fs');
const exec = require('child_process').exec;
require('dotenv').config({path: '../.env'});

async function createNewProject(setupSQLTemplateFile, deleteSQLTemplateFile, projectname){
    //2 steps: create setupProjectXXX.sql file and then deleteProjectXXX.sql file
    //step 1:
    //save path to template file without filename
    let pathToSetupSQLTemplateFile = setupSQLTemplateFile.split('/').slice(0, -1).join('/');
    //read sql-Template file
    let sqlFileCreateProject = await new Promise((resolve, reject) => {
        fs.readFile(setupSQLTemplateFile, 'utf8', function (err,sql) {
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
        fs.writeFile(pathToSetupSQLTemplateFile.concat('/setupProject', projectname, '.sql'), sqlFileCreateProject, function(err) {
            if(err) {
                reject();
            } else{
                resolve();
            }
        }); 
    });
    //step 2:
    //save path to template file without filename
    let pathToDeleteSQLTemplateFile = deleteSQLTemplateFile.split('/').slice(0, -1).join('/');
    //read sql-Template file
    let sqlFileDeleteProject = await new Promise((resolve, reject) => {
        fs.readFile(deleteSQLTemplateFile, 'utf8', function (err,sql) {
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
        fs.writeFile(pathToDeleteSQLTemplateFile.concat('/deleteProject', projectname, '.sql'), sqlFileDeleteProject, function(err) {
            if(err) {
                reject();
            } else{
                resolve();
            }
        }); 
    });
}

async function setupDB(){
    console.log('before test')
    await new Promise((resolve, reject) => {
        exec('./setupDB.bash',
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
    console.log('after test');
    console.log(process.env.SECRET_MESSAGE);
}

//createNewProject('../Database/setupProject/setupProjectTemplate.sql', '../Database/deleteProject/deleteProjectTemplate.sql', 'Bern');
setupDB();