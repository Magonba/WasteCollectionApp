import { User } from '../Model/User';
import { Project } from '../Model/Project';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { exec } from 'child_process';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // necessary for accessing process.env variable

//On this Level error handling should be made
//If there is an error set corresponding User or Project to empty (in memory)
//Also perhaps try to load it from the database again
//What if database was modified during the process? Consider this in error handling

//Singleton
export class Model {
    private static model: Model | undefined;

    private users: User[] = [];
    private projects: Project[] = [];

    //private constructor in order to use await (since await is only allowed in async functions)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    public static async createModel(): Promise<Model> {
        if (typeof Model.model === 'undefined') {
            //create instance of Model
            Model.model = new Model();

            //create users and projects arrays
            await Model.model.createUsers();
            await Model.model.createProjects();

            //create users - projects connection (inside of project/user properties)
            await Model.model.createUserProjectConnections();
        }
        //return model
        return Model.model;
    }

    private async createUsers(): Promise<void> {
        const usersFromDB: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying('SELECT * FROM usersprojects.users');

        for (let index = 0; index < usersFromDB.length; index = index + 1) {
            const userDB: Record<string, string | number | boolean | Date> = usersFromDB[index];
            if (
                typeof userDB.email === 'string' &&
                typeof userDB.admini === 'boolean' &&
                typeof userDB.passwort === 'string'
            ) {
                //wrap in try catch clause (if db insert query encounters problems: delete user from db and memory!)
                const user: User = User.getUserObject(userDB.email, userDB.admini, userDB.passwort);
                this.users.push(user);
            } else {
                const err: Error = new Error(
                    'One of the properties (email, admini, passwort) do not have the correct type!',
                );
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            }
        }
    }

    private async createProjects(): Promise<void> {
        const projectsFromDB: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying('SELECT * FROM usersprojects.projects');

        for (let index = 0; index < projectsFromDB.length; index = index + 1) {
            const projectDB: Record<string, string | number | boolean | Date> = projectsFromDB[index];
            if (typeof projectDB.projectname === 'string') {
                const project: Project = await Project.getProjectObject(projectDB.projectname);
                this.projects.push(project);
            } else {
                const err: Error = new Error('One of the properties (projectname) do not have the correct type!');
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            }
        }
    }

    private async createUserProjectConnections(): Promise<void> {
        const userprojectsFromDB: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying('SELECT * FROM usersprojects.userprojects');

        //iterate over all user - project combination and add them to the Model (i.e. add User to Project OR Project to User)
        for (let index = 0; index < userprojectsFromDB.length; index = index + 1) {
            const userprojectDB: Record<string, string | number | boolean | Date> = userprojectsFromDB[index];
            if (typeof userprojectDB.userid === 'string' && typeof userprojectDB.projectid === 'string') {
                //find user in Model
                const userOfProject = this.users.find((user) => {
                    return user.getMail() === userprojectDB.userid;
                });
                //find project in Model
                const projectOfUser = this.projects.find((project) => {
                    return project.getProjectName() === userprojectDB.projectid;
                });

                //check if user and project were found in Model
                if (typeof userOfProject === 'undefined' || typeof projectOfUser === 'undefined') {
                    const err: Error = new Error(
                        'Could not find user or project (or both) in the Model even though all of them should be present!',
                    );
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                    throw err;
                }

                //add User to Project and Project to User
                userOfProject.addProjectObject(projectOfUser);
                projectOfUser.addUserObject(userOfProject);
            } else {
                const err: Error = new Error('One of the properties (userid, projectid) do not have the correct type!');
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            }
        }
    }

    public getUsers(): User[] {
        return this.users;
    }

    public getProjects(): Project[] {
        return this.projects;
    }

    public async addUser(email: string, admin: boolean, passwordUnsafeVar: string): Promise<void> {
        const user: User = await User.createUser(email, admin, passwordUnsafeVar);
        this.users.push(user);
    }

    public async addProject(projectname: string): Promise<void> {
        const project: Project = await Project.createProject(projectname);
        this.projects.push(project);
    }

    public async deleteUser(email: string): Promise<void> {
        //find user to delete
        const userToDelete: User | undefined = this.users.find((user) => {
            return user.getMail() === email;
        });

        //check if user to delete exists (find method returns undefined in case user to delete does not exist)
        if (typeof userToDelete === 'undefined') {
            const err: Error = new Error('User to delete does not exist!');
            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
            throw err;
        }

        //get projects of user to delete
        const projectsOfUserToDelete: Project[] = userToDelete.getProjects();

        //delete the user from those projects
        for (let index = 0; index < projectsOfUserToDelete.length; index = index + 1) {
            await projectsOfUserToDelete[index].deleteUser(userToDelete);
        }

        //delete user from database
        await (await DatabaseHandler.getDatabaseHandler()).querying(
            `DELETE FROM usersprojects.users WHERE email = '${userToDelete.getMail()}';`,
        );

        //delete user from users array in model
        this.users = this.users.filter((user) => {
            return user !== userToDelete;
        });
    }

    public async deleteProject(projectname: string): Promise<void> {
        //find project to delete
        const projectToDelete: Project | undefined = this.projects.find((project) => {
            return project.getProjectName() === projectname;
        });

        //check if project to delete exists (find method returns undefined in case user to delete does not exist)
        if (typeof projectToDelete === 'undefined') {
            const err: Error = new Error('Project to delete does not exist!');
            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
            throw err;
        }

        //get users of project to delete
        const usersOfProjectToDelete: User[] = projectToDelete.getUsers();

        //delete the project from those users
        for (let index = 0; index < usersOfProjectToDelete.length; index = index + 1) {
            usersOfProjectToDelete[index].deleteProject(projectToDelete);
        }

        //delete project from database
        //delete project from usersprojects.projects
        await (await DatabaseHandler.getDatabaseHandler()).querying(
            `DELETE FROM usersprojects.projects WHERE projectname = '${projectToDelete.getProjectName()}';`,
        );

        //delete tables and schema by executing deleteProject sql file
        const deleteProjectSQLPath =
            process.env.PROJECT_ROOT_PATH + './backend/Database/deleteProject/deleteProject' + projectname + '.sql';
        await new Promise<void>((resolve, reject) => {
            exec(
                `${process.env.PROJECT_ROOT_PATH}./backend/Database/SQLQueryToDB.bash ${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST} ${process.env.DB_PORT} ${deleteProjectSQLPath}`,
                (err: Error | null, stdout: string | null, stderr: string | null) => {
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

        //delete project 'setup' and 'delete' sql files
        const setupProjectSQLPath =
            process.env.PROJECT_ROOT_PATH + './backend/Database/setupProject/setupProject' + projectname + '.sql';
        await new Promise<void>((resolve, reject) => {
            exec(
                `rm ${deleteProjectSQLPath} ${setupProjectSQLPath}`,
                (err: Error | null, stdout: string | null, stderr: string | null) => {
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

        //delete project from projects array in model
        this.projects = this.projects.filter((project) => {
            return project !== projectToDelete;
        });
    }
}
