let express = require('express');
let session = require('express-session');
let FileStore = require('session-file-store')(session);
let bodyParser = require('body-parser');
let bkfd2Password = require('pbkdf2-password')
let hasher = bkfd2Password();
let app = express();
const users = [
    {
        username: 'egoing',
        password: 'WJJ96WIfSM598dFGHK4wSC/PwinPFlJPCzQiOjjrrwSP+trGcDr9JeSFpgmUaP96A+91ZgglcUDrh+xDkAjfgAj0d9NImvXdwiH63IqbA3U4Dsn4JbAy4DHACbcnMDAVr+pGUYEIW0tkGbDBjuMK9o9TOFKAyqWUQQiBOJqM5Xc=',
        salt: 'DWkrLoyKbsLNfIk1zmHihYMTPsGMbEQZHIaHug20VfSaBbr1KJtHFeCIPqdIcEKYcsJU3HEEZ7wsMVVoU87gxg==',
        displayName: 'Egoing'
    }
];

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: '2E!4A#3d%4T5a%34E4!@#4ds!Asd#$',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
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
    let username = req.body.username;
    let password = req.body.password;

    for(let i=0; i<users.length; i++){
        let user = users[i]
        if(username === user.username) {
            return hasher({password:password, salt:user.salt}, function(err, pass, salt, hash){
                if(hash === user.password){
                    req.session.displayName = user.displayName;
                    return req.session.save(function(){
                        res.redirect('/welcome');
                    });
                } else {
                    res.send('Who are u? <a href="/auth/login">login</a>');
                }
            })
        } else {
            res.send('Who are u? <a href="/auth/login">login</a>');
        }
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
            <ul>
                <li><a href="/auth/login">Login</a></li>
                <li><a href="/auth/register">Register</a></li>
            </ul>
        `)
    }
})

app.get('/auth/logout', function(req, res){
    delete req.session.displayName;
    req.session.save(function(){
        res.redirect('/welcome');
    });
})

app.get('/auth/register', function(req, res){
    let output = `
        <h1>Register</h1>
        <form action="/auth/register" method="post">
            <p>
                <input type="text" name="username" placeholder="username">
            </p>
            <p>
                <input type="password" name="password" placeholder="password">
            </p>
            <p>
                <input type="text" name="displayName" placeholder="displayName">
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
    `;
    res.send(output);
})

app.post('/auth/register', function(req, res) {
    hasher({password: req.body.password}, function(err, pass, salt, hash){
        let user = {
            username:req.body.username,
            password:hash,
            salt: salt,
            displayName:req.body.displayName
        };
        users.push(user);
        req.session.displayName = req.body.displayName;
        req.session.save(function(){
            res.redirect('/welcome');
        })
    })
})

app.listen(3003, function(){
    console.log('Connected 3003 port !!');
});
