import { exec } from 'child_process';
import { Logger } from '../Logger/Logger';

new Promise<void>((resolve, reject) => {
    exec(
        `psql -h ${process.env.DB_HOST} -d ${process.env.DB_NAME} -U ${process.env.DB_USER} -p ${process.env.DB_PORT} -a -q -f ${process.env.PROJECT_ROOT_PATH}/backend/Testing/setupSomeProjects.sql`,
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
