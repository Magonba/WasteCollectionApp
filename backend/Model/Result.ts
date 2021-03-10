import { GarbageScenarioVersion } from './GarbageScenarioVersion';
import { CollectionPointScenarioVersion } from './CollectionPointScenarioVersion';
import { VehicleTypeVersion } from './VehicleTypeVersion';
import { Tour } from './Tour';
import { GarbageScenario } from './GarbageScenario';
import { VehicleType } from './VehicleType';
import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { CollectionPointScenario } from './CollectionPointScenario';
import { MapNode } from './MapNode';

export class Result {
    private timing: Date;
    private garbageScenarioVersion: GarbageScenarioVersion;
    private collectionPointScenarioVersion: CollectionPointScenarioVersion;
    private vehicleTypeVersions: VehicleTypeVersion[];
    private model: string;
    private maxWalkingDistance: number;
    private totalTime: number;
    private tours: Tour[];
    private completed = false; //turns true when tours were set

    private constructor(
        timing: Date,
        garbageScenarioVersion: GarbageScenarioVersion,
        collectionPointScenarioVersion: CollectionPointScenarioVersion,
        vehicleTypeVersions: VehicleTypeVersion[],
        model: string,
        maxWalkingDistance: number,
        totalTime: number,
        tours: Tour[],
    ) {
        this.timing = timing;
        this.garbageScenarioVersion = garbageScenarioVersion;
        this.collectionPointScenarioVersion = collectionPointScenarioVersion;
        this.vehicleTypeVersions = vehicleTypeVersions;
        this.model = model;
        this.maxWalkingDistance = maxWalkingDistance;
        this.totalTime = totalTime;
        this.tours = tours;
    }

    public static async createResult(
        projectname: string,
        timing: Date,
        garbageScenarioVersion: GarbageScenarioVersion,
        collectionPointScenarioVersion: CollectionPointScenarioVersion,
        vehicleTypeVersions: VehicleTypeVersion[],
        model: string,
        maxWalkingDistance: number,
    ): Promise<Result> {
        const result: Result = new Result(
            timing,
            garbageScenarioVersion,
            collectionPointScenarioVersion,
            vehicleTypeVersions,
            model,
            maxWalkingDistance,
            0,
            [],
        );

        const timingToString = `${timing.getFullYear()}-${
            timing.getMonth() + 1
        }-${timing.getDate()} ${timing.getHours()}:${timing.getMinutes()}:${timing.getSeconds()}.${timing.getMilliseconds()}`;

        const timingGSVToString = `${garbageScenarioVersion.getTiming().getFullYear()}-${
            garbageScenarioVersion.getTiming().getMonth() + 1
        }-${garbageScenarioVersion
            .getTiming()
            .getDate()} ${garbageScenarioVersion
            .getTiming()
            .getHours()}:${garbageScenarioVersion
            .getTiming()
            .getMinutes()}:${garbageScenarioVersion
            .getTiming()
            .getSeconds()}.${garbageScenarioVersion.getTiming().getMilliseconds()}`;

        const timingCPSVToString = `${collectionPointScenarioVersion.getTiming().getFullYear()}-${
            collectionPointScenarioVersion.getTiming().getMonth() + 1
        }-${collectionPointScenarioVersion
            .getTiming()
            .getDate()} ${collectionPointScenarioVersion
            .getTiming()
            .getHours()}:${collectionPointScenarioVersion
            .getTiming()
            .getMinutes()}:${collectionPointScenarioVersion
            .getTiming()
            .getSeconds()}.${collectionPointScenarioVersion.getTiming().getMilliseconds()}`;

        //insert result
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `INSERT INTO ${projectname}.results VALUES (TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS'), '${garbageScenarioVersion.getGSTitle()}', TO_TIMESTAMP('${timingGSVToString}', 'YYYY-MM-DD HH24:MI:SS.MS'), '${collectionPointScenarioVersion.getCPSTitle()}', TO_TIMESTAMP('${timingCPSVToString}', 'YYYY-MM-DD HH24:MI:SS.MS'), '${model}', ${maxWalkingDistance}, 0);`,
            )
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });

        //insert vehicleTypeVersions
        for (let index = 0; index < vehicleTypeVersions.length; index = index + 1) {
            const timingVTVToString = `${vehicleTypeVersions[index].getTiming().getFullYear()}-${
                vehicleTypeVersions[index].getTiming().getMonth() + 1
            }-${vehicleTypeVersions[index].getTiming().getDate()} ${vehicleTypeVersions[index]
                .getTiming()
                .getHours()}:${vehicleTypeVersions[index].getTiming().getMinutes()}:${vehicleTypeVersions[index]
                .getTiming()
                .getSeconds()}.${vehicleTypeVersions[index].getTiming().getMilliseconds()}`;

            await (await DatabaseHandler.getDatabaseHandler())
                .querying(
                    `INSERT INTO ${projectname}.resultsvehicles VALUES (TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS'), '${vehicleTypeVersions[
                        index
                    ].getVTTitle()}', TO_TIMESTAMP('${timingVTVToString}', 'YYYY-MM-DD HH24:MI:SS.MS'));`,
                )
                .catch((err: Error) => {
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                    throw err;
                });
        }

        return result;
    }

    public static async getResultsObjects(
        projectname: string,
        garbageScenarios: GarbageScenario[],
        collectionPointScenarios: CollectionPointScenario[],
        vehicleTypes: VehicleType[],
        nodes: MapNode[],
    ): Promise<Result[]> {
        //get results
        //by querying the database results table
        const resultsFromDB: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying(`SELECT * FROM ${projectname}.results`);

        const results: Result[] = [];

        //then for each element in the db output
        //get vehicleTypeVersions by querying resultsvehicles table and find corresponding vehicleTypeVersions
        //(same for garbageScenarioVersions and collectionPointScenarioVersions)
        for (let index = 0; index < resultsFromDB.length; index = index + 1) {
            const resultFromDB: Record<string, string | number | boolean | Date> = resultsFromDB[index];

            if (
                resultFromDB.timing instanceof Date &&
                typeof resultFromDB.titlegarbsc === 'string' &&
                resultFromDB.timinggarbsc instanceof Date &&
                typeof resultFromDB.titlecpsc === 'string' &&
                resultFromDB.timingcpsc instanceof Date &&
                typeof resultFromDB.model === 'string' &&
                typeof resultFromDB.maxwalkingdistance === 'number' &&
                typeof resultFromDB.totaltime === 'number'
            ) {
                //find garbageScenarioVersion
                //by finding correct garbageScenario (by title)
                const garbScen: GarbageScenario | undefined = garbageScenarios.find((garbageScenario) => {
                    return garbageScenario.getTitle() === resultFromDB.titlegarbsc;
                });

                if (!(garbScen instanceof GarbageScenario)) {
                    const err: Error = new Error('No GarbageScenario found with corresponding title!');
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                    throw err;
                }

                //find correct garbageScenarioVersion
                //new variable with explicit Date type to deactivate warnings in find-method
                const timinggarbsc: Date = resultFromDB.timinggarbsc;
                const garbageScenarioVersion:
                    | GarbageScenarioVersion
                    | undefined = garbScen.getGarbageScenarioVersions().find((gsv) => {
                    return gsv.getTiming().getTime() === timinggarbsc.getTime();
                });

                if (!(garbageScenarioVersion instanceof GarbageScenarioVersion)) {
                    const err: Error = new Error('No GarbageScenarioVersion found with corresponding timing!');
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                    throw err;
                }

                //find collectionPointScenarioVersion
                //by finding correct collectionPointScenario (by title)
                const collPointScen: CollectionPointScenario | undefined = collectionPointScenarios.find(
                    (collectionPointScenario) => {
                        return collectionPointScenario.getTitle() === resultFromDB.titlecpsc;
                    },
                );

                if (!(collPointScen instanceof CollectionPointScenario)) {
                    const err: Error = new Error('No CollectionPointScenario found with corresponding title!');
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                    throw err;
                }

                //find correct collectionPointScenarioVersion
                //new variable with explicit Date type to deactivate warnings in find-method
                const timingcpsc: Date = resultFromDB.timingcpsc;
                const collectionPointScenarioVersion:
                    | CollectionPointScenarioVersion
                    | undefined = collPointScen.getCollectionPointScenarioVersions().find((cpsv) => {
                    return cpsv.getTiming().getTime() === timingcpsc.getTime();
                });

                if (!(collectionPointScenarioVersion instanceof CollectionPointScenarioVersion)) {
                    const err: Error = new Error('No CollectionPointScenarioVersion found with corresponding timing!');
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                    throw err;
                }

                //get vehicleTypeVersions
                //by querying db for them
                const timingToString = `${resultFromDB.timing.getFullYear()}-${
                    resultFromDB.timing.getMonth() + 1
                }-${resultFromDB.timing.getDate()} ${resultFromDB.timing.getHours()}:${resultFromDB.timing.getMinutes()}:${resultFromDB.timing.getSeconds()}.${resultFromDB.timing.getMilliseconds()}`;

                const resultsVehiclesFromDB: Record<string, string | number | boolean | Date>[] = await (
                    await DatabaseHandler.getDatabaseHandler()
                ).querying(
                    `SELECT * FROM ${projectname}.resultsvehicles WHERE timingresult = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS')`,
                );

                //create empty array with vehicleTypeVersions and then fill it up in for loop
                const vehicleTypeVersions: VehicleTypeVersion[] = [];

                //find for each resultVehicle the corresponding vehicleTypeVersion and push it to the array vehicleTypeVersions
                for (let index = 0; index < resultsVehiclesFromDB.length; index = index + 1) {
                    const resultVehicleFromDB: Record<string, string | number | boolean | Date> =
                        resultsVehiclesFromDB[index];

                    if (
                        resultVehicleFromDB.timingresult instanceof Date &&
                        typeof resultVehicleFromDB.titlevehicletype === 'string' &&
                        resultVehicleFromDB.timingvehicletype instanceof Date
                    ) {
                        //find vehicleType by title
                        const vehType: VehicleType | undefined = vehicleTypes.find((vehicleType) => {
                            return vehicleType.getTitle() === resultVehicleFromDB.titlevehicletype;
                        });

                        if (!(vehType instanceof VehicleType)) {
                            const err: Error = new Error('No VehicleType found with corresponding title!');
                            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                            throw err;
                        }

                        //find vehicleTypeVersion by timing
                        //new variable with explicit Date type to deactivate warnings in find-method
                        const timingvehicletype: Date = resultVehicleFromDB.timingvehicletype;
                        const vehicleTypeVersion:
                            | VehicleTypeVersion
                            | undefined = vehType.getVehicleTypeVersions().find((vtv) => {
                            return vtv.getTiming().getTime() === timingvehicletype.getTime();
                        });

                        if (!(vehicleTypeVersion instanceof VehicleTypeVersion)) {
                            const err: Error = new Error('No VehicleTypeVersion found with corresponding timing!');
                            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                            throw err;
                        }

                        //push vehicleTypeVersion to the array vehicleTypeVersions
                        vehicleTypeVersions.push(vehicleTypeVersion);
                    } else {
                        const err: Error = new Error(
                            'One of the properties (timingresult, titlevehicletype, timingvehicletype) do not have the correct type!',
                        );
                        Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                        throw err;
                    }
                }
                //get Tours with getToursObjects()
                const resultTours: Tour[] = await Tour.getToursObjects(projectname, resultFromDB.timing, nodes);

                //create new result object
                const result: Result = new Result(
                    resultFromDB.timing,
                    garbageScenarioVersion,
                    collectionPointScenarioVersion,
                    vehicleTypeVersions,
                    resultFromDB.model,
                    resultFromDB.maxwalkingdistance,
                    resultFromDB.totaltime,
                    resultTours,
                );

                //push created result to results array
                results.push(result);
            } else {
                const err: Error = new Error(
                    'One of the properties (timing, titlegarbsc, timinggarbsc, titlecpsc, timingcpsc, model, maxwalkingdistance, totaltime) do not have the correct type!',
                );
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            }
        }
        return results;
    }

    public getTiming(): Date {
        return this.timing;
    }

    public getGarbageScenarioVersion(): GarbageScenarioVersion {
        return this.garbageScenarioVersion;
    }

    public getCollectionPointScenarioVersion(): CollectionPointScenarioVersion {
        return this.collectionPointScenarioVersion;
    }

    public getVehicleTypeVersions(): VehicleTypeVersion[] {
        return this.vehicleTypeVersions;
    }

    public getModel(): string {
        return this.model;
    }

    public getMaxWalkingDistance(): number {
        return this.maxWalkingDistance;
    }

    public getTotalTime(): number {
        return this.totalTime;
    }

    private async setTotalTime(projectname: string, totalTime: number): Promise<void> {
        const timingToString = `${this.timing.getFullYear()}-${
            this.timing.getMonth() + 1
        }-${this.timing.getDate()} ${this.timing.getHours()}:${this.timing.getMinutes()}:${this.timing.getSeconds()}.${this.timing.getMilliseconds()}`;

        //change totalTime in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `UPDATE ${projectname}.results
                SET totaltime = ${totalTime}
                WHERE timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS');`,
            )
            .then(() => {
                //only if db query successful change totaltime in memory
                this.totalTime = totalTime;
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public getTours(): Tour[] {
        return this.tours;
    }

    //parameter toursdata is an array with
    //timing: Date,
    //tourtime: number,
    //tourwaste: number,
    //tourNodes: [MapNode, number, number][] (which has a node, wastecollected and ordering)
    public async setTours(
        projectname: string,
        toursData: [Date, number, number, [MapNode, number, number][]][],
    ): Promise<void> {
        if (this.completed === false) {
            //setTours
            for (let index = 0; index < toursData.length; index = index + 1) {
                this.tours.push(
                    await Tour.createTour(
                        projectname,
                        toursData[index][0],
                        this.getTiming(),
                        toursData[index][1],
                        toursData[index][2],
                        toursData[index][3],
                    ),
                );
            }
            //setTotalTime
            const tourTimes: number[] = [];
            for (let index = 0; index < toursData.length; index = index + 1) {
                tourTimes.push(toursData[index][1]);
            }
            const totalTime = tourTimes.reduce((tourtime1, tourtime2) => tourtime1 + tourtime2);
            await this.setTotalTime(projectname, totalTime);

            //set completed to true
            this.completed = true;
        }
    }

    public getCompleted(): boolean {
        return this.completed;
    }
}
