const app = require("./app");
const { PORT, DATABASE_URL } = require("./config");
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});

app.set('db', db);

app.listen(PORT, () => {
  console.log(`Express server is listening at port: ${PORT}`);
  console.log(process.env.DATABASE_URL)
  console.log(process.env.PORT)
  console.log(process.env.CLIENT_ORIGIN)
});
