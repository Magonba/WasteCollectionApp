import winston from 'winston';
import momenttimezone from 'moment-timezone';
import dotenv from 'dotenv';
dotenv.config(); // necessary for accessing process.env variable

//Singleton
export class Logger {
    private static logger = new Logger();

    //data structure for loggers
    private loggers: { [loggerTitle: string]: winston.Logger } = {};
    //todays date in order to organize logs by date
    private today = ''; //by first use will be a date

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    public static getLogger(): Logger {
        return Logger.logger;
    }

    public dbLog(information: string, severity: string): void {
        //update the Logger, i.e. set variables loggers and today correctly
        this.updateLoggers();

        //log the information
        this.loggers.databaseQueries.log({
            message: information,
            level: severity,
            time: `${momenttimezone().hours()}:${momenttimezone().minutes()}:${momenttimezone().seconds()}:${momenttimezone().milliseconds()}`,
        });
    }

    public fileAndConsoleLog(information: string, severity: string): void {
        //update the Logger, i.e. set variables loggers and today correctly
        this.updateLoggers();

        //log the information
        this.loggers.fileAndConsole.log({
            message: information,
            level: severity,
            time: `${momenttimezone().hours()}:${momenttimezone().minutes()}:${momenttimezone().seconds()}:${momenttimezone().milliseconds()}`,
        });
    }

    private updateLoggers() {
        if (Object.keys(this.loggers).length === 0 || this.today !== momenttimezone().format().slice(0, 10)) {
            //reset loggers to empty dictionary
            this.loggers = {};
            //set todays Date variable
            this.today = momenttimezone().format().slice(0, 10);

            //Configuration for Files and Console
            const logConfigFileAndConsole = {
                transports: [
                    new winston.transports.File({
                        level: 'silly',
                        filename: `${process.env.PROJECT_ROOT_PATH}backend/logs/backend/allLogs/${this.today}.log`,
                    }),
                    new winston.transports.File({
                        level: 'info',
                        filename: `${process.env.PROJECT_ROOT_PATH}backend/logs/backend/infoWarnErrorLogs/${this.today}.log`,
                    }),
                    new winston.transports.Console({
                        level: 'info',
                    }),
                ],
            };

            //Configuration for Database queries
            const logConfigDatabaseQueries = {
                transports: [
                    new winston.transports.File({
                        level: 'silly',
                        filename: `${process.env.PROJECT_ROOT_PATH}backend/logs/DatabaseQueries/${this.today}.log`,
                    }),
                ],
            };

            this.loggers['fileAndConsole'] = winston.createLogger(logConfigFileAndConsole);
            this.loggers['databaseQueries'] = winston.createLogger(logConfigDatabaseQueries);
        }
    }
}
