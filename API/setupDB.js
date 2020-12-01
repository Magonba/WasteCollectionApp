const fs = require('fs');

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

createNewProject('../Database/setupProject/setupProjectTemplate.sql', '../Database/deleteProject/deleteProjectTemplate.sql', 'Bern');
