//import { User } from './User';
import { Logger } from '../Logger/Logger';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { type } from 'os';
dotenv.config(); // necessary for accessing process.env variable

/*const myJson: Record<string, string | number | boolean> = {
    text: 'hello',
    message: 'massage',
    completed: true,
    months: 10,
    //date: new Date(),
};
console.log('typeof:');
console.log(typeof myJson);
console.log('Record:');
console.log(myJson);
console.log('Keys:');
console.log(Object.keys(myJson));
console.log('Values:');
console.log(Object.values(myJson));

console.log(
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
);
*/
/*const pool: Pool = new Pool({
    connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, // postgresql://user:password@server:portnb/dbname
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000,
});

const recordo = new Promise<Record<string, string | number | boolean | Date>[]>((resolve, reject) => {
    pool.query('SELECT * FROM usersprojects.users', (err: Error, res) => {
        if (err) {
            console.log(err.stack);
            reject(err);
        } else {
            const myRecords: Record<string, string | number | boolean | Date>[] = [];
            res.rows.forEach((obj) => {
                const keys = Object.keys(obj);
                const myRecord: Record<string, string | number | boolean | Date> = {};
                keys.forEach((key) => {
                    switch (true) {
                        case obj[key] instanceof Date:
                            myRecord[key] = <Date>obj[key];
                            break;
                        case typeof obj[key] === 'string':
                            myRecord[key] = <string>obj[key];
                            break;
                        case typeof obj[key] === 'number':
                            myRecord[key] = <number>obj[key];
                            break;
                        case typeof obj[key] === 'boolean':
                            myRecord[key] = <boolean>obj[key];
                            break;
                        default:
                            reject(Error('One of the properties was not (string | number | boolean | Date)!'));
                            break;
                    }
                });
                myRecords.push(myRecord);
            });
            resolve(myRecords);
        }
    });
});

recordo.then((x) => {
    console.log(x);
});*/

const myArr = undefined;

console.log(typeof myArr);
console.log(typeof myArr === 'undefined');
console.log(typeof myArr === undefined);
