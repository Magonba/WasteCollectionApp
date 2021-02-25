import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { MapArc } from './MapArc';
import { VehicleTypeVersion } from './VehicleTypeVersion';

export class VehicleType {
    private title: string;
    private averageSpeed: number;
    private averageStopTime: number;
    private vehicleCapacity: number;
    private vehicleTypeVersions: VehicleTypeVersion[];

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

    public getVehicleTypeVersions(): VehicleTypeVersion[] {
        return this.vehicleTypeVersions;
    }
}
