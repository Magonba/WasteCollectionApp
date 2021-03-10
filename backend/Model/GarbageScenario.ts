import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { GarbageScenarioVersion } from './GarbageScenarioVersion';
import { MapNode } from './MapNode';
import { Result } from './Result';

export class GarbageScenario {
    private title: string;
    private garbageScenarioVersions: GarbageScenarioVersion[];

    private constructor(title: string, garbageScenarioVersions: GarbageScenarioVersion[]) {
        this.title = title;
        this.garbageScenarioVersions = garbageScenarioVersions;
    }

    public static async createGarbageScenario(projectname: string, title: string): Promise<GarbageScenario> {
        const garbageScenario: GarbageScenario = new GarbageScenario(title, []);

        await (await DatabaseHandler.getDatabaseHandler())
            .querying(`INSERT INTO ${projectname}.garbagescenarios VALUES ('${title}');`)
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });

        return garbageScenario;
    }

    public static async getGarbageScenariosObjects(projectname: string, nodes: MapNode[]): Promise<GarbageScenario[]> {
        const garbScenariosFromDB: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying(`SELECT * FROM ${projectname}.garbagescenarios`);

        const garbageScenarios: GarbageScenario[] = [];

        for (let index = 0; index < garbScenariosFromDB.length; index = index + 1) {
            const garbScenarioFromDB: Record<string, string | number | boolean | Date> = garbScenariosFromDB[index];

            if (typeof garbScenarioFromDB.title === 'string') {
                //create GarbageScenario
                //by getting its GarbageScenarioVersions (by its title)
                const garbageScenarioVersions: GarbageScenarioVersion[] = await GarbageScenarioVersion.getGarbageScenarioVersionsObjects(
                    projectname,
                    garbScenarioFromDB.title,
                    nodes,
                );

                //then construct the GarbageScenario Object with its title and GarbageScenarioVersions
                const garbageScenario: GarbageScenario = new GarbageScenario(
                    garbScenarioFromDB.title,
                    garbageScenarioVersions,
                );

                //and push it to the array
                garbageScenarios.push(garbageScenario);
            } else {
                const err: Error = new Error('One of the properties (title) do not have the correct type!');
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            }
        }
        return garbageScenarios;
    }

    public getTitle(): string {
        return this.title;
    }

    public async setTitle(projectname: string, title: string): Promise<void> {
        //change title in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `UPDATE ${projectname}.garbagescenarios
                SET title = '${title}'
                WHERE title = '${this.title}';`,
            )
            .then(() => {
                //only if db query successful change title in memory
                this.title = title;

                //set title for each gsversion
                for (let index = 0; index < this.garbageScenarioVersions.length; index = index + 1) {
                    this.garbageScenarioVersions[index].setGSTitle(title);
                }
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public getGarbageScenarioVersions(): GarbageScenarioVersion[] {
        return this.garbageScenarioVersions;
    }

    public async addGarbageScenarioVersion(
        projectname: string,
        timing: Date,
        nodesWaste: [MapNode, number][],
    ): Promise<GarbageScenarioVersion> {
        const garbageScenarioVersion: GarbageScenarioVersion = await GarbageScenarioVersion.createGarbageScenarioVersion(
            projectname,
            this.title,
            timing,
            nodesWaste,
        );

        this.garbageScenarioVersions.push(garbageScenarioVersion);

        return garbageScenarioVersion;
    }

    public async deleteGarbageScenarioVersion(
        projectname: string,
        garbageScenarioVersion: GarbageScenarioVersion,
        results: Result[],
    ): Promise<void> {
        //delete gsv in database
        const timingToString = `${garbageScenarioVersion.getTiming().getFullYear()}-${
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

        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `DELETE FROM ${projectname}.garbagescenarioversions WHERE title = '${this.title}' AND timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS');`,
            )
            .then(() => {
                //only if db query successful delete garbagescenarioversion from array
                this.garbageScenarioVersions = this.garbageScenarioVersions.filter((gsv) => {
                    return gsv !== garbageScenarioVersion;
                });
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });

        //delete also results with those gsvs
        for (let index = 0; index < results.length; index = index + 1) {
            if (
                results[index].getGarbageScenarioVersion().getTiming().getTime() ===
                garbageScenarioVersion.getTiming().getTime()
            ) {
                results.splice(results.indexOf(results[index]), 1);
            }
        }
    }
}
