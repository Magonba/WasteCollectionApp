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
                    `SELECT * FROM ${projectname}.resultsvehicles WHERE timingresult = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH:MI:SS.MS')`,
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

    public getTours(): Tour[] {
        return this.tours;
    }
}
