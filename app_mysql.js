let express = require('express');
let bodyParser = require('body-parser');
let multer = require('multer');
let _storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
let upload = multer({ storage: _storage })
let fs = require('fs');

let mysql = require('mysql');
const {auth} = require("mysql/lib/protocol/Auth");
let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '111111',
    database: 'o2'
});

conn.connect();

let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.locals.pretty = true;
app.use('/user', express.static('uploads'));

app.set('views', './views_mysql');
app.set('view engine', 'jade');

app.get('/upload', function(req, res){
    res.render('upload');
})
app.get('/topic/add', function(req, res){
    let sql = 'SELECT id, title FROM topic';
    conn.query(sql, function(err, topics, fields){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
       res.render('add', {topics: topics});
    });
})
app.post('/topic/add', function(req, res){
    let title = req.body.title;
    let description = req.body.description;
    let author = req.body.author;
    let sql = 'INSERT INTO topic (title, description, author) VALUES(?, ?, ?)';
    conn.query(sql, [title, description, author], function(err, result, fields){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/topic/'+result.insertId);
        }
    });
})
app.get('/topic/:id/edit', function(req, res){
    let sql = 'SELECT id, title FROM topic';
    conn.query(sql, function(err, topics, fields){
        let id = req.params.id;
        if(id){
            let sql = 'SELECT * FROM topic WHERE id=?'
            conn.query(sql, [id], function(err, topic, fields){
                if(err){
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('edit', {topics:topics, topic:topic[0]})
                }
            })
        } else {
            console.log('There is no id.');
            res.status(500).send('Internal Server Error');
        }

    });
})
app.post('/topic/:id/edit', function(req, res){
    let id = req.params.id;
    let title = req.body.title;
    let description = req.body.description;
    let author = req.body.author;
    let sql = 'UPDATE topic SET title=?, description=?, author=? WHERE id=?';
    conn.query(sql, [title, description, author, id], function(err, result, fields){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/topic/'+ id);
        }
    });
})
app.get('/topic/:id/delete', function(req, res){
    let sql = 'SELECT id, title FROM topic';
    conn.query(sql, function(err, topics, fields){
        let sql = 'SELECT * FROM topic WHERE id=?';
        let id = req.params.id;
        conn.query(sql, [id], function(err, topic){
            if(err){
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                if(topic.length == 0){
                    console.log('There is no record.');
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('delete', {topics:topics, topic:topic[0]})
                }
            }
        })
    })
})
app.get(['/topic', '/topic/:id'], function(req, res){
    let sql = 'SELECT id, title FROM topic';
    conn.query(sql, function(err, topics, fields){
        let id = req.params.id;
        if(id){
            let sql = 'SELECT * FROM topic WHERE id=?'
            conn.query(sql, [id], function(err, topic, fields){
                if(err){
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('view', {topics:topics, topic:topic[0]})
                }
            })
        } else {
            res.render('view', {topics:topics})
        }

    });
})

app.post('/upload', upload.single('userfile'), function(req, res){
    res.send('Uploaded : '+req.file.filename);
})

app.listen(3000, function(){
    console.log('Connected, 3000 Port');
})