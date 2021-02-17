import { Logger } from '../Logger/Logger';

const myLogger = Logger.getLogger();

myLogger.dbLog('Some SQL Query', 'silly');
myLogger.dbLog('Some SQL Query2', 'debug');
myLogger.dbLog('Some SQL Query3', 'verbose');
myLogger.dbLog('Some SQL Query4', 'info');
myLogger.dbLog('Some SQL Query5', 'warn');
myLogger.dbLog('Some SQL Query6', 'error');

myLogger.fileAndConsoleLog('Some information', 'silly');
myLogger.fileAndConsoleLog('Some information2', 'debug');
myLogger.fileAndConsoleLog('Some information3', 'verbose');
myLogger.fileAndConsoleLog('Some information4', 'info');
myLogger.fileAndConsoleLog('Some information5', 'warn');
myLogger.fileAndConsoleLog('Some information6', 'error');

test('The result of this test suite will always be OK according to Jest... Check in [rootFolder]/backend/logs if logs are correct!', async () => {
    expect(0).toBe(0);
});
