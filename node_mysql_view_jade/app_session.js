let express = require('express');
let session = require('express-session');
let bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: '2E!4A#3d%4T5a%34E4!@#4ds!Asd#$',
    resave: false,
    saveUninitialized: true
}));

app.get('/count', function(req, res){
    if(req.session.count){
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send('count : '+req.session.count);
});

app.get('/auth/login', function(req, res){
    let output = `
        <h1>Login</h1>
        <form action="/auth/login" method="post">
            <p>
                <input type="text" name="username" placeholder="username">
            </p>
            <p>
                <input type="password" name="password" placeholder="password">
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
    `;

    res.send(output);
})

app.post('/auth/login', function(req, res){
    let user = {
      username: 'egoing',
      password: '111',
      displayName: 'Egoing'
    };
    let username = req.body.username;
    let password = req.body.password;
    if(username === user.username && password === user.password){
        req.session.displayName = user.displayName;
        res.redirect('/welcome');
    } else {
        res.send('Who are u? <a href="/auth/login">login</a>');
    }
})

app.get('/welcome', function(req, res){
    if(req.session.displayName){
        res.send(`
            <h1>Hello, ${req.session.displayName}</h1>
            <a href="/auth/logout">Logout</a>
        `);
    } else {
        res.send(`
            <h1>Welcome</h1>
            <a href="/auth/login">Login</a>
        `)
    }
})

app.get('/auth/logout', function(req, res){
    delete req.session.displayName;
    res.redirect('/welcome');
})

app.listen(3003, function(){
    console.log('Connected 3003 port !!');
});
