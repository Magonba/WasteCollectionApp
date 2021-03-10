import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { MapArc } from './MapArc';
import { Result } from './Result';
import { VehicleTypeVersion } from './VehicleTypeVersion';

export class VehicleType {
    private title: string;
    private averageSpeed: number;
    private averageStopTime: number;
    private vehicleCapacity: number;
    private vehicleTypeVersions: VehicleTypeVersion[];

    //NOTE: when vehicleTypeVersion is deleted, delete also results linked to it! (cannot be done automatically in db!)

    private constructor(
        title: string,
        averageSpeed: number,
        averageStopTime: number,
        vehicleCapacity: number,
        vehicleTypeVersions: VehicleTypeVersion[],
    ) {
        this.title = title;
        this.averageSpeed = averageSpeed;
        this.averageStopTime = averageStopTime;
        this.vehicleCapacity = vehicleCapacity;
        this.vehicleTypeVersions = vehicleTypeVersions;
    }

    public static async createVehicleType(
        projectname: string,
        title: string,
        averageSpeed: number,
        averageStopTime: number,
        vehicleCapacity: number,
    ): Promise<VehicleType> {
        const vehicleType: VehicleType = new VehicleType(title, averageSpeed, averageStopTime, vehicleCapacity, []);

        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `INSERT INTO ${projectname}.vehicletypes VALUES ('${title}', ${averageSpeed}, ${averageStopTime}, ${vehicleCapacity});`,
            )
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });

        return vehicleType;
    }

    public static async getVehicleTypesObjects(projectname: string, arcs: MapArc[]): Promise<VehicleType[]> {
        const vehicleTypesFromDB: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying(`SELECT * FROM ${projectname}.vehicletypes`);

        const vehicleTypes: VehicleType[] = [];

        for (let index = 0; index < vehicleTypesFromDB.length; index = index + 1) {
            const vehicleTypeFromDB: Record<string, string | number | boolean | Date> = vehicleTypesFromDB[index];

            if (
                typeof vehicleTypeFromDB.title === 'string' &&
                typeof vehicleTypeFromDB.averagespeed === 'number' &&
                typeof vehicleTypeFromDB.averagestoptime === 'number' &&
                typeof vehicleTypeFromDB.vehiclecapacity === 'number'
            ) {
                //create VehicleType
                //by getting its VehicleTypeVersions (by its title)
                const vehicleTypeVersions: VehicleTypeVersion[] = await VehicleTypeVersion.getVehicleTypeVersionsObjects(
                    projectname,
                    vehicleTypeFromDB.title,
                    arcs,
                );

                //then construct the VehicleType Object with its title and VehicleTypeVersions
                const vehicleType: VehicleType = new VehicleType(
                    vehicleTypeFromDB.title,
                    vehicleTypeFromDB.averagespeed,
                    vehicleTypeFromDB.averagestoptime,
                    vehicleTypeFromDB.vehiclecapacity,
                    vehicleTypeVersions,
                );

                //and push it to the array
                vehicleTypes.push(vehicleType);
            } else {
                const err: Error = new Error(
                    'One of the properties (title, averagespeed, averagestoptime, vehiclecapacity) do not have the correct type!',
                );
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            }
        }
        return vehicleTypes;
    }

    public getTitle(): string {
        return this.title;
    }

    public async setTitle(projectname: string, title: string): Promise<void> {
        //change title in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `UPDATE ${projectname}.vehicletypes
                SET title = '${title}'
                WHERE title = '${this.title}';`,
            )
            .then(() => {
                //only if db query successful change title in memory
                this.title = title;

                //set title for each vtversion
                for (let index = 0; index < this.vehicleTypeVersions.length; index = index + 1) {
                    this.vehicleTypeVersions[index].setVTTitle(title);
                }
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public getAverageSpeed(): number {
        return this.averageSpeed;
    }

    public async setAverageSpeed(projectname: string, averageSpeed: number): Promise<void> {
        //change averagespeed in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `UPDATE ${projectname}.vehicletypes
                SET averagespeed = ${averageSpeed}
                WHERE title = '${this.title}';`,
            )
            .then(() => {
                //only if db query successful change averagespeed in memory
                this.averageSpeed = averageSpeed;
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public getAverageStopTime(): number {
        return this.averageStopTime;
    }

    public async setAverageStopTime(projectname: string, averageStopTime: number): Promise<void> {
        //change averagestoptime in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `UPDATE ${projectname}.vehicletypes
                SET averagestoptime = ${averageStopTime}
                WHERE title = '${this.title}';`,
            )
            .then(() => {
                //only if db query successful change averagestoptime in memory
                this.averageStopTime = averageStopTime;
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public getVehicleCapacity(): number {
        return this.vehicleCapacity;
    }

    public async setVehicleCapacity(projectname: string, vehicleCapacity: number): Promise<void> {
        //change vehiclecapacity in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `UPDATE ${projectname}.vehicletypes
                SET vehiclecapacity = ${vehicleCapacity}
                WHERE title = '${this.title}';`,
            )
            .then(() => {
                //only if db query successful change averagestoptime in memory
                this.vehicleCapacity = vehicleCapacity;
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public getVehicleTypeVersions(): VehicleTypeVersion[] {
        return this.vehicleTypeVersions;
    }

    public async addVehicleTypeVersion(
        projectname: string,
        timing: Date,
        arcsActivated: [MapArc, boolean][],
    ): Promise<VehicleTypeVersion> {
        const vehicleTypeVersion: VehicleTypeVersion = await VehicleTypeVersion.createVehicleTypeVersion(
            projectname,
            this.title,
            timing,
            arcsActivated,
        );

        this.vehicleTypeVersions.push(vehicleTypeVersion);

        return vehicleTypeVersion;
    }

    public async deleteVehicleTypeVersion(
        projectname: string,
        vehicleTypeVersion: VehicleTypeVersion,
        results: Result[],
    ): Promise<void> {
        //delete vtv in database
        const timingToString = `${vehicleTypeVersion.getTiming().getFullYear()}-${
            vehicleTypeVersion.getTiming().getMonth() + 1
        }-${vehicleTypeVersion
            .getTiming()
            .getDate()} ${vehicleTypeVersion
            .getTiming()
            .getHours()}:${vehicleTypeVersion
            .getTiming()
            .getMinutes()}:${vehicleTypeVersion
            .getTiming()
            .getSeconds()}.${vehicleTypeVersion.getTiming().getMilliseconds()}`;

        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `DELETE FROM ${projectname}.vehicletypeversions WHERE title = '${this.title}' AND timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS');`,
            )
            .then(() => {
                //only if db query successful delete vehicleTypeVersion from array
                this.vehicleTypeVersions = this.vehicleTypeVersions.filter((vtv) => {
                    return vtv !== vehicleTypeVersion;
                });
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });

        //delete results with vtv
        const newResults: Result[] = [...results];
        for (let outerIndex = 0; outerIndex < newResults.length; outerIndex = outerIndex + 1) {
            const vehTypeVers: VehicleTypeVersion[] = newResults[outerIndex].getVehicleTypeVersions();
            for (let innerIndex = 0; innerIndex < vehTypeVers.length; innerIndex = innerIndex + 1) {
                if (vehTypeVers[innerIndex].getTiming().getTime() === vehicleTypeVersion.getTiming().getTime()) {
                    const timingToString = `${newResults[outerIndex].getTiming().getFullYear()}-${
                        newResults[outerIndex].getTiming().getMonth() + 1
                    }-${newResults[outerIndex].getTiming().getDate()} ${newResults[outerIndex]
                        .getTiming()
                        .getHours()}:${newResults[outerIndex].getTiming().getMinutes()}:${newResults[outerIndex]
                        .getTiming()
                        .getSeconds()}.${newResults[outerIndex].getTiming().getMilliseconds()}`;
                    await (await DatabaseHandler.getDatabaseHandler())
                        .querying(
                            `DELETE FROM ${projectname}.results WHERE timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS');`,
                        )
                        .then(() => {
                            //only if db query successful delete result from results array
                            results.splice(results.indexOf(newResults[outerIndex]), 1);
                        })
                        .catch((err: Error) => {
                            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                            throw err;
                        });
                }
            }
        }
    }
}
