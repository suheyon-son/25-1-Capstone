const express = require('express')
const path = require('path');
const app = express()
const port = 3000

const mysql = require('mysql2/promise');

const init = async function() {
    const module = {};
    const createConnection = function(){
        return mysql.createConnection({
            host: 'localhost', // MySQL 서버 주소
            user: 'root', // MySQL 사용자 이름
            password: 'admin', // MySQL 비밀번호
            database: 'pothole' // 사용할 데이터베이스 이름
        });
    }

    module.getData = async function(query){
        const connection = await createConnection();
        try{
            await connection.connect();
            const [results, fields] = await connection.query(query);
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
})
















app.use('/static', express.static(path.join(__dirname, 'static')));


app.get('/api/road', async (req, res) => {
    const order = req.query.order || 'road'; // 기본값은 'road'
    let arr;
    if (order === 'road') {
        arr = await db.getData(`
            SELECT pothole.road_id, pothole_depth, pothole_width, road_danger, pothole_date
            FROM pothole JOIN road ON pothole.road_id = road.road_id
            ORDER BY road_id DESC`);
    } else if (order === 'pothole') {
        arr = await db.getData(`
            SELECT pothole.road_id, pothole_depth, pothole_width, road_danger, pothole_date
            FROM pothole JOIN road ON pothole.road_id = road.road_id
            ORDER BY pothole_id DESC`);
    } else if (order === 'danger') {
        arr = await db.getData(`
            SELECT pothole.road_id, pothole_depth, pothole_width, road_danger, pothole_date
            FROM pothole JOIN road ON pothole.road_id = road.road_id
            ORDER BY road_danger DESC`);
    } else if (order === 'length') {
        arr = await db.getData(`
            SELECT pothole.road_id, pothole_depth, pothole_width, road_danger, pothole_date
            FROM pothole JOIN road ON pothole.road_id = road.road_id
            ORDER BY road_length DESC`);
    } else if (order === 'width') {
        arr = await db.getData(`
            SELECT pothole.road_id, pothole_depth, pothole_width, road_danger, pothole_date
            FROM pothole JOIN road ON pothole.road_id = road.road_id
            ORDER BY road_width DESC`);
    } else {
        arr = [];
    }
    res.send(JSON.stringify(arr));
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


