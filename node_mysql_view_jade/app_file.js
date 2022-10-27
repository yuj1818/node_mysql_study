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
let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.locals.pretty = true;
app.use('/user', express.static('uploads'));

app.set('views', './views_file');
app.set('view engine', 'jade');

app.get('/upload', function(req, res){
    res.render('upload');
})
app.get('/topic/new', function(req, res){
    fs.readdir('data', function(err, files){
        if(err){
            console.log(err)
            res.status(500).send('Internal Server Error');
        }
        res.render('new', {topics: files})
    })
})
app.get(['/topic', '/topic/:id'], function(req, res){
    fs.readdir('data', function(err, files){
        if(err){
            console.log(err)
            res.status(500).send('Internal Server Error');
        }
        let id = req.params.id;
        if(id){
            fs.readFile('data/'+id, 'utf8', function(err, data){
                if(err){
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                }
                res.render('view', {topics:files, title:id, description:data});
            })
        } else {
            res.render('view', {topics: files, title:'Welcome', description:'Hello, JavaScript for Server'});
        }
    })
})
app.post('/topic', function(req, res){
    let title = req.body.title;
    let description = req.body.description;
    fs.writeFile('data/'+title, description, function(err){
        if(err){
            res.status(500).send('Internal Server Error');
        }
        res.redirect('/topic/'+title);
    });
})
app.post('/upload', upload.single('userfile'), function(req, res){
    res.send('Uploaded : '+req.file.filename);
})

app.listen(3000, function(){
    console.log('Connected, 3000 Port');
})