import { User } from '../Model/User';
import { Project } from '../Model/Project';
import { DatabaseHandler } from '../Database/DatabaseHandler';

//Singleton
export class Model {
    private static model: Model = new Model();

    private users: User[] = []; //change
    private projects: Project[] = []; //change
    //userprojects: [User, Project][] = []; //not necessary

    //private constructor in order to use await (since await is only allowed in async functions)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    public static async createModel(): Promise<Model> {
        //create users and projects table
        await Model.model.createUsers();
        await Model.model.createProjects();

        //create users - projects connection

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
                this.users.push(await User.createUser(userDB.email, userDB.admini, userDB.passwort));
            } else {
                throw new Error('One of the properties (email, admini, passwort) do not have the correct type!');
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
                this.projects.push(new Project(projectDB.projectname));
            } else {
                throw new Error('One of the properties (projectname) do not have the correct type!');
            }
        }
    }

    public getUsers(): User[] {
        return this.users;
    }

    public getProjects(): Project[] {
        return this.projects;
    }
}
