const mysql = require('mysql2/promise');


const createConnection = async function(){
    return await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'admin',
        database: 'pothole'
    });
}


//레거시
const getData = async function(query){
    const connection = await createConnection();
    try{
        await connection.connect();
        const [results, fields] = await connection.query(query);
        return results;
    }catch(e){
        console.error(e);
        throw e;
    }finally{
        await connection.end();
    }
};


module.exports = {
    getData,
};