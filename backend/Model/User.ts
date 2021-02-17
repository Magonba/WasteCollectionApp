import { Project } from './Project';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';

export class User {
    private email: string;
    private admin: boolean;
    private passwordUnsafeVar: string; //should be modified!!!
    private projects: Project[] = []; //addProject(...) and deleteProject(...) will be managed/called through the Model class/object

    private static dbHandler: DatabaseHandler;

    //private constructor in order to create dbHandler with await (since await is only allowed in async functions)
    private constructor(email: string, admin: boolean, passwordUnsafeVar: string) {
        //constructor is not finished (db queries missing)
        this.email = email;
        this.admin = admin;
        this.passwordUnsafeVar = passwordUnsafeVar;
    }

    public static async createUser(email: string, admin: boolean, passwordUnsafeVar: string): Promise<User> {
        //create dbHandler as soon as possible. Since this method is the first method called of this class, dbHandler is created here.
        if (typeof User.dbHandler === 'undefined') {
            User.dbHandler = await DatabaseHandler.getDatabaseHandler();
        }

        return new User(email, admin, passwordUnsafeVar);
    }

    public getMail(): string {
        return this.email;
    }

    public async setMail(email: string): Promise<void> {
        //change email in database
        await User.dbHandler
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
            });
    }

    public getAdmin(): boolean {
        return this.admin;
    }

    public async setAdmin(admin: boolean): Promise<void> {
        //change admini in database
        await User.dbHandler
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
            });
    }

    public getPassword(): string {
        return this.passwordUnsafeVar;
    }

    public async setPassword(newPassword: string): Promise<void> {
        //change passwort in database
        await User.dbHandler
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
            });
    }

    public getProjects(): Project[] {
        return this.projects;
    }

    //private setter for projects because it should be used just for reading values from the database
    //in order to change the projects array from outside use addProject(...) and deleteProject(...)
    //for the moment: just use addProject(...) and deleteProject(...) to modify the User projects
    /*private setProjects() {

    }*/

    public async addProject(project: Project): Promise<void> {
        const userProject: JSON[] = await User.dbHandler.querying(
            `SELECT * FROM usersprojects.userprojects
            WHERE projectid = '${project.getProjectName()}' AND userid = '${this.getMail()}'`,
        );

        if (userProject.length < 1) {
            //in this case create
            //1. project - user connection in db
            await this.addProjectToUserDB(project).catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                return;
            });
            //2. add project to user inside the User Object
            this.addProjectToUser(project);
            //3. add user to project inside the Project Object
            await project.addUser(this);
        } else {
            //in this case add only project inside User Object (since the other two were already executed inside the Project class)
            this.addProjectToUser(project);
        }
    }

    private async addProjectToUserDB(project: Project): Promise<void> {
        //change userprojects in database
        await User.dbHandler.querying(
            `INSERT INTO usersprojects.userprojects VALUES ('${this.getMail()}', '${project.getProjectName()}');`,
        );
    }

    private addProjectToUser(project: Project): void {
        this.projects.push(project);
    }

    public async deleteProject(project: Project): Promise<void> {
        const userProject: JSON[] = await User.dbHandler.querying(
            `SELECT * FROM usersprojects.userprojects
            WHERE projectid = '${project.getProjectName()}' AND userid = '${this.getMail()}'`,
        );

        if (userProject.length > 0) {
            //in this case delete:
            //1. project - user connection in db
            await this.deleteProjectFromUserDB(project).catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                return;
            });
            //2. project from user inside the User Object
            this.deleteProjectFromUser(project);
            //3. user from Project Object
            await project.deleteUser(this);
        } else {
            //in this case delete only project inside User Object (since the other two were already executed inside the Project class)
            this.deleteProjectFromUser(project);
        }
    }

    private async deleteProjectFromUserDB(project: Project): Promise<void> {
        //change userprojects in database
        await User.dbHandler.querying(
            `DELETE FROM usersprojects.userprojects WHERE projectid = '${project.getProjectName()}' AND userid = '${this.getMail()}';`,
        );
    }

    private deleteProjectFromUser(projectToDelete: Project) {
        this.projects = this.projects.filter((project) => {
            return project !== projectToDelete;
        });
    }
}
