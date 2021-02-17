import { User } from './User';
import { Graph } from './Graph';
import { GarbageScenario } from './GarbageScenario';
import { CollectionPointScenario } from './CollectionPointScenario';
import { VehicleType } from './VehicleType';
import { Result } from './Result';
import { Logger } from '../Logger/Logger';
import { DatabaseHandler } from '../Database/DatabaseHandler';

export class Project {
    private projectname: string;
    private users: User[] | undefined;
    private graph: Graph | undefined;
    private garbageScenarios: GarbageScenario[] | undefined;
    private collectionPointScenarios: CollectionPointScenario[] | undefined;
    private vehicleTypes: VehicleType[] | undefined;
    private results: Result[] | undefined;

    //if modifiedBy === undefined Project will not be loaded in Memory
    //as soon as the Project is no longer being modified, modifiedBy switches to undefined
    //and users, graph, garbageScenarios, collectionPointScenarios, vehicleTypes, results switch to undefined as well
    //in order to save memory
    private modifiedBy: User | undefined;

    public constructor(
        projectname: string,
        users?: User[],
        graph?: Graph,
        garbageScenarios?: GarbageScenario[],
        collectionPointScenarios?: CollectionPointScenario[],
        vehicleTypes?: VehicleType[],
        results?: Result[],
        modifiedBy?: User,
    ) {
        this.projectname = projectname;
        this.users = users;
        this.graph = graph;
        this.garbageScenarios = garbageScenarios;
        this.collectionPointScenarios = collectionPointScenarios;
        this.vehicleTypes = vehicleTypes;
        this.results = results;
        this.modifiedBy = modifiedBy;
    }

    public getProjectName(): string {
        return this.projectname;
    }

    public async addUser(user: User): Promise<void> {
        const projectUser: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying(
            `SELECT * FROM usersprojects.userprojects
            WHERE projectid = '${this.getProjectName()}' AND userid = '${user.getMail()}'`,
        );

        if (projectUser.length < 1) {
            //in this case create
            //1. user - project connection in db
            await this.addUserToProjectDB(user).catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                return;
            });
            //2. add user to project inside the Project Object
            this.addUserToProject(user);
            //3. add project to user inside the User Object
            await user.addProject(this);
        } else {
            //in this case add only user inside Project Object (since the other two were already executed inside the User class)
            this.addUserToProject(user);
        }
    }

    private async addUserToProjectDB(user: User) {
        //change userprojects in database
        await (await DatabaseHandler.getDatabaseHandler()).querying(
            `INSERT INTO usersprojects.userprojects VALUES ('${user.getMail()}', '${this.getProjectName()}');`,
        );
    }

    private addUserToProject(user: User): void {
        if (typeof this.users === 'undefined') {
            const err: Error = new Error('users array is undefined');
            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
            throw err;
        } else {
            this.users.push(user);
        }
    }

    public async deleteUser(user: User): Promise<void> {
        const projectUser: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying(
            `SELECT * FROM usersprojects.userprojects
            WHERE projectid = '${this.getProjectName()}' AND userid = '${user.getMail()}'`,
        );

        if (projectUser.length > 0) {
            //in this case delete:
            //1. user - project connection in db
            await this.deleteUserFromProjectDB(user).catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                return;
            });
            //2. user from project inside the Project Object
            this.deleteUserFromProject(user);
            //3. project from User Object
            await user.deleteProject(this);
        } else {
            //in this case delete only user inside Project Object (since the other two were already executed inside the User class)
            this.deleteUserFromProject(user);
        }
    }

    private async deleteUserFromProjectDB(user: User): Promise<void> {
        //change userprojects in database
        await (await DatabaseHandler.getDatabaseHandler()).querying(
            `DELETE FROM usersprojects.userprojects WHERE projectid = '${this.getProjectName()}' AND userid = '${user.getMail()}';`,
        );
    }

    private deleteUserFromProject(userToDelete: User): void {
        if (typeof this.users === 'undefined') {
            const err: Error = new Error('users array is undefined');
            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
            throw err;
        } else {
            this.users = this.users.filter((user) => {
                return user !== userToDelete;
            });
        }
    }
}
