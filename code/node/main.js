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

app.get('/api/area1', async (req, res) => {
    let query = `
        SELECT road_area1
        FROM road
    `;
    const arr = await mysql.getData(query);
    res.send(JSON.stringify(arr));
});

app.get('/api/area2', async (req, res) => {
    let query = `
        SELECT road_area2
        FROM road
        WHERE 1=1
    `;
    if(req.query.area1){
        const area1 = req.query.area1;
        query += ` AND road_area1 = '${area1}'`;
    }else{
        return res.status(418).send('Forbidden');
    }
    const arr = await mysql.getData(query);
    res.send(JSON.stringify(arr));
});

app.get('/api/road_name', async (req, res) => {
    const area1 = req.query.area1;
    const area2 = req.query.area2;
    let query = `
        SELECT road_name
        FROM road
        WHERE 1=1
    `;
    if(area1 && area2){
        query += ` AND road_area1 = '${area1}' AND road_area2 = '${area2}'`;
    }else{
        return res.status(418).send('Forbidden');
    }
    const arr = await mysql.getData(query);
    res.send(JSON.stringify(arr));
});

app.get('/api/pothole_map', async (req, res) => {
    const area1 = req.query.area1;
    const area2 = req.query.area2;
    const road_name = req.query.road_name;
    const danger_min = req.query.danger_min;
    const danger_max = req.query.danger_max;
    const depth_min = req.query.depth_min;
    const depth_max = req.query.depth_max;
    const width_min = req.query.width_min;
    const width_max = req.query.width_max;
    let query = `
        SELECT pothole_latitude, pothole_longtitude
        FROM pothole JOIN road ON pothole.road_id = road.road_id
        WHERE 1=1
    `;
    if(area1 && area2 && road_name){
        query += ` AND road_area1 = '${area1}' AND road_area2 = '${area2}' AND road_name = '${road_name}'`;
    }else if(area1 && area2){
        query += ` AND road_area1 = '${area1}' AND road_area2 = '${area2}'`;
    }else if(area1){
        query += ` AND road_area1 = '${area1}'`;
    }
    if(danger_min && danger_max){
        query += ` AND road_danger BETWEEN ${danger_min} AND ${danger_max}`;
    }else if(danger_min){
        query += ` AND road_danger >= ${danger_min}`;
    }else if(danger_max){
        query += ` AND road_danger <= ${danger_max}`;
    }
    if(depth_min && depth_max){
        query += ` AND pothole_depth BETWEEN ${depth_min} AND ${depth_max}`;
    }else if(depth_min){
        query += ` AND pothole_depth >= ${depth_min}`;
    }else if(depth_max){
        query += ` AND pothole_depth <= ${depth_max}`;
    }
    const arr = await mysql.getData(query);
    res.send(JSON.stringify(arr));
});

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

