import { Project } from './Project';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';

export class User {
    private email: string;
    private admin: boolean;
    private passwordUnsafeVar: string; //should be modified!!!
    private projects: Project[] = []; //addProject(...) and deleteProject(...) will be managed/called through the Model class/object

    private constructor(email: string, admin: boolean, passwordUnsafeVar: string) {
        this.email = email;
        this.admin = admin;
        this.passwordUnsafeVar = passwordUnsafeVar;
    }

    //returns a User object without modifying the database
    //use this method if user is already registered in database (i.e. when reading database at setup of program)
    public static getUserObject(email: string, admin: boolean, passwordUnsafeVar: string): User {
        return new User(email, admin, passwordUnsafeVar);
    }

    //returns a User object AND updates database with user entry
    //use this method if the user is not yet registered in database
    public static async createUser(email: string, admin: boolean, passwordUnsafeVar: string): Promise<User> {
        //insert user to database
        await (await DatabaseHandler.getDatabaseHandler()).querying(
            `INSERT INTO usersprojects.users VALUES ('${email}', '${admin}, '${passwordUnsafeVar}');`,
        );
        //return user object
        return new User(email, admin, passwordUnsafeVar);
    }

    public getMail(): string {
        return this.email;
    }

    public async setMail(email: string): Promise<void> {
        //change email in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `UPDATE usersprojects.users
                SET email = '${email}'
                WHERE email = '${this.email}';`,
            )
            .then(() => {
                //only if db query successful change email in memory
                this.email = email;
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public getAdmin(): boolean {
        return this.admin;
    }

    public async setAdmin(admin: boolean): Promise<void> {
        //change admini in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `UPDATE usersprojects.users
                SET admini = ${admin}
                WHERE email = '${this.email}';`,
            )
            .then(() => {
                //only if db query successful change admin in memory
                this.admin = admin;
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public getPassword(): string {
        return this.passwordUnsafeVar;
    }

    public async setPassword(newPassword: string): Promise<void> {
        //change passwort in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `UPDATE usersprojects.users
                SET passwort = '${newPassword}'
                WHERE email = '${this.email}';`,
            )
            .then(() => {
                //only if db query successful change passwordUnsafeVar in memory
                this.passwordUnsafeVar = newPassword;
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public getProjects(): Project[] {
        return this.projects;
    }

    //private setter for projects because it should be used just for reading values from the database
    //in order to change the projects array from outside use addProject(...) and deleteProject(...)
    //for the moment: just use addProject(...) and deleteProject(...) to modify the User projects
    //private setProjects() {}

    //if project - user connection is already established in database (e.g. when reading the database)
    public addProjectObject(project: Project): void {
        this.projects.push(project);
    }

    //if project - user connection is NOT established in the database
    public async addProject(project: Project): Promise<void> {
        //create
        //1. project - user connection in db
        await this.addProjectToUserDB(project).catch((err: Error) => {
            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
            throw err;
        });
        //2. add project to user inside the User Object
        this.projects.push(project);
        //3. add user to project inside the Project Object
        project.addUserObject(this);
    }

    private async addProjectToUserDB(project: Project): Promise<void> {
        //change userprojects in database
        await (await DatabaseHandler.getDatabaseHandler()).querying(
            `INSERT INTO usersprojects.userprojects VALUES ('${this.getMail()}', '${project.getProjectName()}');`,
        );
    }

    //if user - project connection was already deleted in database
    public deleteProjectObject(projectToDelete: Project): void {
        this.projects = this.projects.filter((project) => {
            return project !== projectToDelete;
        });
    }

    //if user - project connection was NOT deleted in database
    public async deleteProject(projectToDelete: Project): Promise<void> {
        //delete:
        //1. project - user connection in db
        await this.deleteProjectFromUserDB(projectToDelete).catch((err: Error) => {
            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
            throw err;
        });
        //2. project from user inside the User Object
        this.projects = this.projects.filter((project) => {
            return project !== projectToDelete;
        });
        //3. user from Project Object
        projectToDelete.deleteUserObject(this);
    }

    private async deleteProjectFromUserDB(project: Project): Promise<void> {
        //change userprojects in database
        await (await DatabaseHandler.getDatabaseHandler()).querying(
            `DELETE FROM usersprojects.userprojects WHERE projectid = '${project.getProjectName()}' AND userid = '${this.getMail()}';`,
        );
    }
}
