const express = require('express')
const path = require('path');
const app = express()
const port = 3000
const mysql = require('mysql2/promise');

const init = async function() {
    const module = {};
    const createConnection = function(){
        return mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'admin',
            database: 'pothole'
        });
    }

  module.getPosList = async function(){
      const connection = await createConnection();
      try{
          await connection.connect();
          const [results, fields] = await connection.query('SELECT x, y FROM pothole');
          return results;
      }catch(e){
          throw e;
      }finally{
          await connection.end();
      }
  };
  return module;
}
init().then(function(module){
  global.db = module;
});

app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/api', async (req, res) => {
  const arr = await db.getPosList();
  res.send(JSON.stringify(arr));
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


