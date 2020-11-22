const router = require('koa-router')();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

//const readCalculatedResults = require('./accessPSQL.js').readCalculatedResults;
//const deleteResult = require('./accessPSQL.js').deleteResult;

const app = new Koa()

router.get('/results/', listResults)
      .del('/results/:id', clearResult)
      .get('/timenow', getTime)

async function listResults(ctx) {
    /*console.log(ctx)
    myResults = await readCalculatedResults()
    ctx.body = myResults
    console.log(ctx.body)*/
}

async function clearResult(ctx) {
  /*const id = ctx.params.id;
  deleteResult(id);
  ctx.status = 204;*/
}

async function getTime(ctx) {
  /*const id = ctx.params.id;
  deleteResult(id);
  ctx.status = 204;*/
}

app
  .use(bodyParser())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(8040);