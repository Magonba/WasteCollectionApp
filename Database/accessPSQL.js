const util = require('util')
const {Pool, Client} = require('pg')
const connectionString = 'postgresql://wastecollectiondata:wastecollectiondata@localhost:5432/wastecollectiondata' // postgresql://user:password@server:portnb/dbname
const client = new Client({
    connectionString: connectionString,
})
client.connect()

client.query('SELECT NOW()', (err, res) => {
    console.log('client')
    console.log(err, res)
})

/*const readCalculatedResults = async() => {
    var calculatedResults = [];
    console.log('starting client.query...')
    await new Promise((resolve, reject) => {
        client.query(`SELECT * FROM calculatedResults`, (err, res) => {
            if(res.rows.length == 0){
                return;
            }
            console.log('inside client.query...')
            for (var i = 0; i < res.rows.length;  i++) {
                var modelID = res.rows[i].modelid;
                var score = res.rows[i].score;
                var energy = res.rows[i].energy;
                var zeit = res.rows[i].zeit;
                var noise = res.rows[i].noise;
                var gehdistanz = res.rows[i].gehdistanz;
  
                var result = {};
                result.modelID = modelID;
                result.score = score;
                result.energy = energy;
                result.zeit = zeit;
                result.noise = noise;
                result.gehdistanz = gehdistanz;
  
                calculatedResults.push(result);
            }
            console.log('at the end of client.query...')
            resolve()
        })
    });
    console.log('about to return client.query...')
    return calculatedResults;
}

const deleteResult = async(id) => {
    return new Promise((resolve, reject) => {
      client.query(`DELETE FROM calculatedResults WHERE modelid=${id};`, (err, res) => {
        resolve();
      });
    });
  }

readCalculatedResults().then((res) => {
    console.log(res)
});

module.exports.readCalculatedResults = readCalculatedResults;
module.exports.deleteResult = deleteResult;
*/