const router = require('koa-router')();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const accessPSQL = require('./accessPSQL.js');

const app = new Koa()

router.get('/projects/', listProjects)

async function listProjects(ctx){
  myProjects = await accessPSQL.readProjects();
  ctx.body = myProjects;
}

app
  .use(bodyParser())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);