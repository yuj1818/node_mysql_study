let express = require('express');
let app = express();
let bodyParser = require('body-parser');
app.locals.pretty = true;
app.set('view engine', 'jade');
app.set('views', './views');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/form', function(req, res){
    res.render('form');
});

app.post('/form_receiver', function(req, res){
    let title = req.body.title;
    let description = req.body.description;
    res.send(title+','+description);
});

app.get('/form_receiver', function(req, res){
    let title = req.query.title;
    let description = req.query.description;
    res.send(title+','+description)
})

app.get('/topic/:id', function(req,res){
    let topics = [
        'Javascript is....',
        'Nodejs is...',
        'Express is...'
    ];
    let output = `
        <a href="/topic/0">JavaScript</a><br>
        <a href="/topic/1">Nodejs</a><br>
        <a href="/topic/2">Express</a><br><br>
        ${topics[req.params.id]}
    `
    res.send(output);
})

app.get('/topic/:id/:mode', function(req, res){
    res.send(req.params.id+','+req.params.mode)
})

app.get('/template', function(req, res){
    res.render('temp', {time:Date(), title:'Jade'});
})
app.get('/', function(req, res){
    res.send('Hello home page');
});
app.get('/dynamic', function(req, res){
    let lis = '';
    for(let i=0; i<5; i++) {
        lis = lis + '<li>coding</li>';
    }
    let time = Date();
    let output = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <title></title>
        </head>
        <body>
            Hello, Dynamic!
            <ul>${lis}</ul>
            ${time}
        </body>
    </html>`;
    res.send(output);
})
app.get('/route', function(req, res){
    res.send('Hello Router, <img src="/route.png">')
})
app.get('/login', function(req, res){
    res.send('<h1>Login please</h1>');
});
app.listen(3001, function(){
    console.log('Conneted 3000 port!');
});