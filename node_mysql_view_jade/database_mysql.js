let mysql = require('mysql');
let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '111111',
    database: 'o2'
});

conn.connect();

// let sql = 'SELECT * FROM topic';
// conn.query(sql, function(err, rows, fileds){
//     if(err) {
//         console.log(err);
//     } else {
//         for(let i = 0; i < rows.length; i++ ){
//             console.log(rows[i].author)
//         }
//     }
// });

// let sql = 'INSERT INTO topic (title, description, author) VALUES(?, ?, ?)';
// let params = ['Supervisor', 'Watcher', 'graphittie'];
//
// conn.query(sql, params, function(err, rows, fields){
//     if(err){
//         console.log(err)
//     } else {
//         console.log(rows);
//     }
// })

// let sql = 'UPDATE topic SET title=?, author=? WHERE id=?';
// let params = ['NodeJs', 'leezche', 6];
//
// conn.query(sql, params, function(err, rows, fields){
//     if(err){
//         console.log(err)
//     } else {
//         console.log(rows)
//     }
// })

let sql = 'DELETE FROM topic WHERE id=?';
let params = [1];

conn.query(sql, params, function(err, rows, fields){
    if(err){
        console.log(err)
    } else {
        console.log(rows)
    }
})

conn.end();