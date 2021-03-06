import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { MapArc } from './MapArc';

export class VehicleTypeVersion {
    private vtTitle: string;
    private timing: Date; //maybe adapt (not string)
    private arcsActivated: [MapArc, boolean][]; //referenced MapArc and boolean for activation

    private constructor(vtTitle: string, timing: Date, arcsActivated: [MapArc, boolean][]) {
        this.vtTitle = vtTitle;
        this.timing = timing;
        this.arcsActivated = arcsActivated;
    }

    public static async createVehicleTypeVersion(
        projectname: string,
        title: string,
        timing: Date,
        arcsActivated: [MapArc, boolean][],
    ): Promise<VehicleTypeVersion> {
        const vehicleTypeVersion: VehicleTypeVersion = new VehicleTypeVersion(title, timing, arcsActivated);

        const timingToString = `${timing.getFullYear()}-${
            timing.getMonth() + 1
        }-${timing.getDate()} ${timing.getHours()}:${timing.getMinutes()}:${timing.getSeconds()}.${timing.getMilliseconds()}`;

        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `INSERT INTO ${projectname}.vehicletypeversions VALUES ('${title}', TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS'));`,
            )
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });

        for (let index = 0; index < arcsActivated.length; index = index + 1) {
            await (await DatabaseHandler.getDatabaseHandler())
                .querying(
                    `INSERT INTO ${projectname}.vehicletypeversions_nodes_activatedarcs VALUES (${arcsActivated[
                        index
                    ][0]
                        .getSourceNode()
                        .getNodeID()}, ${arcsActivated[index][0]
                        .getDestinationNode()
                        .getNodeID()}, '${title}', TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS'), ${
                        arcsActivated[index][1]
                    });`,
                )
                .catch((err: Error) => {
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                    throw err;
                });
        }
        return vehicleTypeVersion;
    }

    public static async getVehicleTypeVersionsObjects(
        projectname: string,
        title: string,
        arcs: MapArc[],
    ): Promise<VehicleTypeVersion[]> {
        const vehicleTypeVersionsFromDB: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying(`SELECT * FROM ${projectname}.vehicletypeversions WHERE title = '${title}'`);

        const vehicleTypeVersions: VehicleTypeVersion[] = [];

        for (let index = 0; index < vehicleTypeVersionsFromDB.length; index = index + 1) {
            const vehicleTypeVersionFromDB: Record<string, string | number | boolean | Date> =
                vehicleTypeVersionsFromDB[index];

            if (typeof vehicleTypeVersionFromDB.title === 'string' && vehicleTypeVersionFromDB.timing instanceof Date) {
                //create VehicleTypeVersion
                //by querying vehicletypeversions_nodes_activatedarcs table
                const timingToString = `${vehicleTypeVersionFromDB.timing.getFullYear()}-${
                    vehicleTypeVersionFromDB.timing.getMonth() + 1
                }-${vehicleTypeVersionFromDB.timing.getDate()} ${vehicleTypeVersionFromDB.timing.getHours()}:${vehicleTypeVersionFromDB.timing.getMinutes()}:${vehicleTypeVersionFromDB.timing.getSeconds()}.${vehicleTypeVersionFromDB.timing.getMilliseconds()}`;

                const arcsActivatedFromDB: Record<string, string | number | boolean | Date>[] = await (
                    await DatabaseHandler.getDatabaseHandler()
                ).querying(
                    `SELECT * FROM ${projectname}.vehicletypeversions_nodes_activatedarcs WHERE title = '${title}' AND timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS')`,
                );

                //then initialize arcsActivated array variable correctly
                const arcsActivated: [MapArc, boolean][] = [];

                for (let index = 0; index < arcsActivatedFromDB.length; index = index + 1) {
                    const arcActivatedFromDB: Record<string, string | number | boolean | Date> =
                        arcsActivatedFromDB[index];

                    if (
                        typeof arcActivatedFromDB.sourcenodeid === 'number' &&
                        typeof arcActivatedFromDB.destinationnodeid === 'number' &&
                        typeof arcActivatedFromDB.title === 'string' &&
                        arcActivatedFromDB.timing instanceof Date &&
                        typeof arcActivatedFromDB.activated === 'boolean'
                    ) {
                        //create arcsActivated element
                        //by searching in arcs for MapArc with matching nodeids for source and destination node
                        const activatedArc: MapArc | undefined = arcs.find((arc) => {
                            return (
                                arc.getSourceNode().getNodeID() === arcActivatedFromDB.sourcenodeid &&
                                arc.getDestinationNode().getNodeID() === arcActivatedFromDB.destinationnodeid
                            );
                        });

                        //check if activatedArc is undefined (i.e. if it was found in the arcs array)
                        if (typeof activatedArc === 'undefined') {
                            const err: Error = new Error('activatedArc is undefined');
                            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                            throw err;
                        }

                        //then push [MapArc, activated] to arcsActivated
                        arcsActivated.push([activatedArc, arcActivatedFromDB.activated]);
                    } else {
                        const err: Error = new Error(
                            'One of the properties (sourcenodeid, destinationnodeid, title, timing, activated) do not have the correct type!',
                        );
                        Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                        throw err;
                    }
                }

                //then create VehicleTypeVersion object
                const vehicleTypeVersion: VehicleTypeVersion = new VehicleTypeVersion(
                    title,
                    vehicleTypeVersionFromDB.timing,
                    arcsActivated,
                );

                //and push it into the vehicleTypeVersions array
                vehicleTypeVersions.push(vehicleTypeVersion);
            } else {
                const err: Error = new Error('One of the properties (title, timing) do not have the correct type!');
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            }
        }
        return vehicleTypeVersions;
    }

    public getVTTitle(): string {
        return this.vtTitle;
    }

    //should only be called from VehicleType (when setting the title)
    public setVTTitle(vtTitle: string): void {
        this.vtTitle = vtTitle;
    }

    public getTiming(): Date {
        return this.timing;
    }

    public getArcsActivated(): [MapArc, boolean][] {
        return this.arcsActivated;
    }
}
