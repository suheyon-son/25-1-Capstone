const express = require('express')
const path = require('path');
const mysql = require('./mysql_wrapper.js');
const app = express()
const port = 20402

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/api/pothole_pos', async (req, res) => {
    const order = req.query.order;
    let arr;
    if (true) {
        arr = await mysql.getData(`
            SELECT pothole_latitude, pothole_longtitude
            FROM pothole`);
    } else {
        return res.status(418).send('Forbidden');
    }
    res.send(JSON.stringify(arr));
});

app.get('/api/road', async (req, res) => {
    const order = req.query.order;
    let arr;
    if (order === 'road') {
        arr = await mysql.getData(`
            SELECT pothole.road_id, pothole_depth, pothole_width, road_danger, pothole_date
            FROM pothole JOIN road ON pothole.road_id = road.road_id
            ORDER BY road_id DESC`);
    } else if (order === 'pothole') {
        arr = await mysql.getData(`
            SELECT pothole.road_id, pothole_depth, pothole_width, road_danger, pothole_date
            FROM pothole JOIN road ON pothole.road_id = road.road_id
            ORDER BY pothole_id DESC`);
    } else if (order === 'danger') {
        arr = await mysql.getData(`
            SELECT pothole.road_id, pothole_depth, pothole_width, road_danger, pothole_date
            FROM pothole JOIN road ON pothole.road_id = road.road_id
            ORDER BY road_danger DESC`);
    } else if (order === 'depth') {
        arr = await mysql.getData(`
            SELECT pothole.road_id, pothole_depth, pothole_width, road_danger, pothole_date
            FROM pothole JOIN road ON pothole.road_id = road.road_id
            ORDER BY pothole_depth DESC`);
    } else if (order === 'width') {
        arr = await mysql.getData(`
            SELECT pothole.road_id, pothole_depth, pothole_width, road_danger, pothole_date
            FROM pothole JOIN road ON pothole.road_id = road.road_id
            ORDER BY pothole_width DESC`);
    } else {
        return res.status(418).send('Forbidden');
    }
    res.send(JSON.stringify(arr));
});

