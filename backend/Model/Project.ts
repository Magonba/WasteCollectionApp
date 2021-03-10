import { User } from './User';
import { Graph } from './Graph';
import { GarbageScenario } from './GarbageScenario';
import { CollectionPointScenario } from './CollectionPointScenario';
import { VehicleType } from './VehicleType';
import { Result } from './Result';
import { Logger } from '../Logger/Logger';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { exec } from 'child_process';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // necessary for accessing process.env variable
import { readFile, writeFile } from 'fs';
import { VehicleTypeVersion } from './VehicleTypeVersion';
import { CollectionPointScenarioVersion } from './CollectionPointScenarioVersion';
import { GarbageScenarioVersion } from './GarbageScenarioVersion';

export class Project {
    private projectname: string;
    private users: User[];
    private graph: Graph;
    private garbageScenarios: GarbageScenario[];
    private collectionPointScenarios: CollectionPointScenario[];
    private vehicleTypes: VehicleType[];
    private results: Result[];

    //as soon as the Project is no longer being modified, modifiedBy switches to undefined
    private modifiedBy: User | undefined;

    private constructor(
        projectname: string,
        users: User[],
        graph: Graph,
        garbageScenarios: GarbageScenario[],
        collectionPointScenarios: CollectionPointScenario[],
        vehicleTypes: VehicleType[],
        results: Result[],
    ) {
        this.projectname = projectname;
        this.users = users;
        this.graph = graph;
        this.garbageScenarios = garbageScenarios;
        this.collectionPointScenarios = collectionPointScenarios;
        this.vehicleTypes = vehicleTypes;
        this.results = results;
    }

    public static async getProjectObject(projectname: string): Promise<Project> {
        //project is simply in schema 'projectname'
        //then read the data (graph, users, garbageScenarios, etc) into the object
        const graph: Graph = await Graph.getGraphObject(projectname);
        const garbageScenarios: GarbageScenario[] = await GarbageScenario.getGarbageScenariosObjects(
            projectname,
            graph.getNodes(),
        );
        const collectionPointScenarios: CollectionPointScenario[] = await CollectionPointScenario.getCollectionPointScenariosObjects(
            projectname,
            graph.getNodes(),
        );
        const vehicleTypes: VehicleType[] = await VehicleType.getVehicleTypesObjects(projectname, graph.getArcs());
        const results: Result[] = await Result.getResultsObjects(
            projectname,
            garbageScenarios,
            collectionPointScenarios,
            vehicleTypes,
            graph.getNodes(),
        );

        const project: Project = new Project(
            projectname,
            [],
            graph,
            garbageScenarios,
            collectionPointScenarios,
            vehicleTypes,
            results,
        );

        return project;
    }

    public static async createProject(projectname: string): Promise<Project> {
        //create a completely new project
        //in usersprojects schema
        await (await DatabaseHandler.getDatabaseHandler()).querying(
            `INSERT INTO usersprojects.projects VALUES ('${projectname}');`,
        );

        //create setup and delete sql files
        await Project.createProjectSQLFiles(
            './backend/Database/setupProject/setupProjectTemplate.sql',
            './backend/Database/deleteProject/deleteProjectTemplate.sql',
            projectname,
        );

        //create 'projectname' schema
        const createProjectSQLPath =
            process.env.PROJECT_ROOT_PATH + './backend/Database/setupProject/setupProject' + projectname + '.sql';
        await new Promise<void>((resolve, reject) => {
            exec(
                `${process.env.PROJECT_ROOT_PATH}./backend/Database/SQLQueryToDB.bash ${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST} ${process.env.DB_PORT} ${createProjectSQLPath}`,
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

        //all fields are empty except of projectname
        //later the fields will be filled with data as the user adds them
        const project: Project = new Project(projectname, [], Graph.createGraph([], []), [], [], [], []);

        //return project
        return project;
    }

    private static async createProjectSQLFiles(
        setupSQLTemplateRelPath: string,
        deleteSQLTemplateRelPath: string,
        projectname: string,
    ) {
        //2 steps: create setupProjectXXX.sql file and then deleteProjectXXX.sql file
        //step 1:
        //setup path
        const setupSQLTemplateAbsPath: string = process.env.PROJECT_ROOT_PATH + setupSQLTemplateRelPath;

        //save path to template file without filename for later use
        const dirOfSetupSQLTemplate: string = setupSQLTemplateAbsPath.split('/').slice(0, -1).join('/');

        //read sql-Template file
        let sqlFileCreateProject: string = await new Promise<string>((resolve, reject) => {
            readFile(setupSQLTemplateAbsPath, 'utf8', function (err, sql: string) {
                if (err) {
                    Logger.getLogger().fileAndConsoleLog(err.code === undefined ? '' : err.code, 'error');
                    reject();
                }
                resolve(sql);
            });
        });

        //replace "REPLACEWITHPROJECTNAME" with projectname
        sqlFileCreateProject = sqlFileCreateProject.split('REPLACEWITHPROJECTNAME').join(projectname);

        //write createProjectXXX.sql File
        await new Promise<void>((resolve, reject) => {
            writeFile(dirOfSetupSQLTemplate + '/setupProject' + projectname + '.sql', sqlFileCreateProject, (err) => {
                if (err) {
                    Logger.getLogger().fileAndConsoleLog(err.code === undefined ? '' : err.code, 'error');
                    reject();
                } else {
                    resolve();
                }
            });
        });

        //step 2:
        //delete path
        const deleteSQLTemplateAbsPath: string = process.env.PROJECT_ROOT_PATH + deleteSQLTemplateRelPath;

        //save path to template file without filename for later use
        const dirOfDeleteSQLTemplate = deleteSQLTemplateAbsPath.split('/').slice(0, -1).join('/');

        //read sql-Template file
        let sqlFileDeleteProject: string = await new Promise<string>((resolve, reject) => {
            readFile(deleteSQLTemplateAbsPath, 'utf8', (err, sql) => {
                if (err) {
                    Logger.getLogger().fileAndConsoleLog(err.code === undefined ? '' : err.code, 'error');
                    reject();
                }
                resolve(sql);
            });
        });

        //replace "REPLACEWITHPROJECTNAME" with projectname
        sqlFileDeleteProject = sqlFileDeleteProject.split('REPLACEWITHPROJECTNAME').join(projectname);

        //write deleteProjectXXX.sql File
        await new Promise<void>((resolve, reject) => {
            writeFile(dirOfDeleteSQLTemplate + '/deleteProject' + projectname + '.sql', sqlFileDeleteProject, (err) => {
                if (err) {
                    Logger.getLogger().fileAndConsoleLog(err.code === undefined ? '' : err.code, 'error');
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    public getProjectName(): string {
        return this.projectname;
    }

    public getUsers(): User[] {
        return this.users;
    }

    public getGraph(): Graph {
        return this.graph;
    }

    public getGarbageScenarios(): GarbageScenario[] {
        return this.garbageScenarios;
    }

    public async addGarbageScenario(title: string): Promise<GarbageScenario> {
        const garbageScenario: GarbageScenario = await GarbageScenario.createGarbageScenario(this.projectname, title);

        this.garbageScenarios.push(garbageScenario);

        return garbageScenario;
    }

    public async deleteGarbageScenario(garbageScenario: GarbageScenario): Promise<void> {
        //delete all gsvs
        while (garbageScenario.getGarbageScenarioVersions().length > 0) {
            garbageScenario.deleteGarbageScenarioVersion(
                this.projectname,
                garbageScenario.getGarbageScenarioVersions()[0],
                this.results,
            );
        }

        //delete gs in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(`DELETE FROM ${this.projectname}.garbagescenarios WHERE title = '${garbageScenario.getTitle()}';`)
            .then(() => {
                //only if db query successful delete garbagescenario from array
                this.garbageScenarios = this.garbageScenarios.filter((gs) => {
                    return gs !== garbageScenario;
                });
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public getCollectionPointScenarios(): CollectionPointScenario[] {
        return this.collectionPointScenarios;
    }

    public async addCollectionPointScenario(title: string): Promise<CollectionPointScenario> {
        const collectionPointScenario: CollectionPointScenario = await CollectionPointScenario.createCollectionPointScenario(
            this.projectname,
            title,
        );

        this.collectionPointScenarios.push(collectionPointScenario);

        return collectionPointScenario;
    }

    public async deleteCollectionPointScenario(collectionPointScenario: CollectionPointScenario): Promise<void> {
        //delete all cpsvs
        while (collectionPointScenario.getCollectionPointScenarioVersions().length > 0) {
            collectionPointScenario.deleteCollectionPointScenarioVersion(
                this.projectname,
                collectionPointScenario.getCollectionPointScenarioVersions()[0],
                this.results,
            );
        }

        //delete cps in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `DELETE FROM ${
                    this.projectname
                }.collectionpointscenarios WHERE title = '${collectionPointScenario.getTitle()}';`,
            )
            .then(() => {
                //only if db query successful delete collectionpointscenario from array
                this.collectionPointScenarios = this.collectionPointScenarios.filter((cps) => {
                    return cps !== collectionPointScenario;
                });
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public getVehicleTypes(): VehicleType[] {
        return this.vehicleTypes;
    }

    public async addVehicleType(
        title: string,
        averageSpeed: number,
        averageStopTime: number,
        vehicleCapacity: number,
    ): Promise<VehicleType> {
        const vehicleType: VehicleType = await VehicleType.createVehicleType(
            this.projectname,
            title,
            averageSpeed,
            averageStopTime,
            vehicleCapacity,
        );

        this.vehicleTypes.push(vehicleType);

        return vehicleType;
    }

    public async deleteVehicleType(vehicleType: VehicleType): Promise<void> {
        //delete all vtvs
        while (vehicleType.getVehicleTypeVersions().length > 0) {
            vehicleType.deleteVehicleTypeVersion(
                this.projectname,
                vehicleType.getVehicleTypeVersions()[0],
                this.results,
            );
        }

        //delete vt in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(`DELETE FROM ${this.projectname}.vehicletypes WHERE title = '${vehicleType.getTitle()}';`)
            .then(() => {
                //only if db query successful delete vehicletype from array
                this.vehicleTypes = this.vehicleTypes.filter((vt) => {
                    return vt !== vehicleType;
                });
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public getResults(): Result[] {
        return this.results;
    }

    public async addResult(
        timing: Date,
        garbageScenarioVersion: GarbageScenarioVersion,
        collectionPointScenarioVersion: CollectionPointScenarioVersion,
        vehicleTypeVersions: VehicleTypeVersion[],
        model: string,
        maxWalkingDistance: number,
    ): Promise<Result> {
        const result: Result = await Result.createResult(
            this.projectname,
            timing,
            garbageScenarioVersion,
            collectionPointScenarioVersion,
            vehicleTypeVersions,
            model,
            maxWalkingDistance,
        );

        this.results.push(result);

        return result;
    }

    public async deleteResult(result: Result): Promise<void> {
        //delete result in database
        const timingToString = `${result.getTiming().getFullYear()}-${
            result.getTiming().getMonth() + 1
        }-${result
            .getTiming()
            .getDate()} ${result
            .getTiming()
            .getHours()}:${result
            .getTiming()
            .getMinutes()}:${result.getTiming().getSeconds()}.${result.getTiming().getMilliseconds()}`;

        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `DELETE FROM ${this.projectname}.results WHERE timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS');`,
            )
            .then(() => {
                //only if db query successful delete result from array
                this.results = this.results.filter((res) => {
                    return res !== result;
                });
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public async setProjectName(projectname: string): Promise<void> {
        //change projectname in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `UPDATE usersprojects.projects
                SET projectname = ${projectname}
                WHERE projectname = '${this.projectname}';`,
            )
            .then(() => {
                //only if db query successful change projectname in memory
                this.projectname = projectname;
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
            });
    }

    public setModifiedBy(userOrUndefined: User | undefined): void {
        this.modifiedBy = userOrUndefined;
    }

    //if project - user connection is already established in database (e.g. when reading the database)
    public addUserObject(user: User): void {
        this.users.push(user);
    }

    //if project - user connection is NOT established in the database
    public async addUser(user: User): Promise<void> {
        //create
        //1. user - project connection in db
        await this.addUserToProjectDB(user).catch((err: Error) => {
            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
            return;
        });
        //2. add user to project inside the Project Object
        this.users.push(user);
        //3. add project to user inside the User Object
        user.addProjectObject(this);
    }

    private async addUserToProjectDB(user: User) {
        //change userprojects in database
        await (await DatabaseHandler.getDatabaseHandler()).querying(
            `INSERT INTO usersprojects.userprojects VALUES ('${user.getMail()}', '${this.getProjectName()}');`,
        );
    }

    //if user - project connection was already deleted in database
    public deleteUserObject(userToDelete: User): void {
        this.users = this.users.filter((user) => {
            return user !== userToDelete;
        });
    }

    //if user - project connection still has to be deleted in database
    public async deleteUser(userToDelete: User): Promise<void> {
        //delete:
        //1. user - project connection in db
        await this.deleteUserFromProjectDB(userToDelete).catch((err: Error) => {
            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
            return;
        });
        //2. user from project inside the Project Object
        this.users = this.users.filter((user) => {
            return user !== userToDelete;
        });
        //3. project from User Object
        userToDelete.deleteProjectObject(this);
    }

    private async deleteUserFromProjectDB(user: User): Promise<void> {
        //change userprojects in database
        await (await DatabaseHandler.getDatabaseHandler()).querying(
            `DELETE FROM usersprojects.userprojects WHERE projectid = '${this.getProjectName()}' AND userid = '${user.getMail()}';`,
        );
    }
}
