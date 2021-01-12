const util = require('util')
const {Pool, Client} = require('pg')
const connectionString = 'postgresql://wastecollectiondata:wastecollectiondata@localhost:5432/wastecollectiondata' // postgresql://user:password@server:portnb/dbname
const client = new Client({
    connectionString: connectionString,
})
client.connect()

const readProjects = async() => {
    var projects = [];
    await new Promise((resolve, reject) => {
        client.query(`SELECT * FROM projects`, (err, res) => {
            if(err){
                console.log("error:");
                console.log(err);
                return;
            }
            if(res.rows.length == 0){
                console.log("no content");
                return;
            }
            projects = res.rows;
            resolve()
        })
    });
    return projects;
}

module.exports.readProjects = readProjects;