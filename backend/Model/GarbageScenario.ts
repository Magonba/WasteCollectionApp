import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { GarbageScenarioVersion } from './GarbageScenarioVersion';
import { MapNode } from './MapNode';

export class GarbageScenario {
    private title: string;
    private garbageScenarioVersions: GarbageScenarioVersion[];

    private constructor(title: string, garbageScenarioVersions: GarbageScenarioVersion[]) {
        this.title = title;
        this.garbageScenarioVersions = garbageScenarioVersions;
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

    public getGarbageScenarioVersions(): GarbageScenarioVersion[] {
        return this.garbageScenarioVersions;
    }
}
