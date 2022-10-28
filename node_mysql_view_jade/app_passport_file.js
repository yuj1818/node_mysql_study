let express = require('express');
let session = require('express-session');
let FileStore = require('session-file-store')(session);
let bodyParser = require('body-parser');
let bkfd2Password = require('pbkdf2-password')
let hasher = bkfd2Password();
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
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
}));

app.use(passport.initialize());

app.use(passport.session());

app.get('/count', function(req, res){
    if(req.session.count){
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send('count : '+req.session.count);
});

app.get('/auth/logout', function(req, res, next){
    req.logout(function(err){
        if(err){
            return next(err);
        }
        req.session.destroy();
        res.redirect('/welcome');
    })
});

app.get('/welcome', function(req, res){
    //passport에 의해 req에 user라는 객체가 생성되었는지 확인 && 생성된 user 객체에 displayName이 존재하는지 확인
    //req.user는 deserializeUser에 의해 생성
    if(req.user && req.user.displayName){
        res.send(`
            <h1>Hello, ${req.user.displayName}</h1>
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
});

passport.serializeUser(function(user, done){
    //session에 현재 접근하고 있는 사용자에 대한 정보(username)가 저장됨
    done(null, user.username);
});

//serializeUser에 의해 session 에 저장된 username이 있다면 deserializeUser의 callback 함수가 작동
//user.username => id
passport.deserializeUser(function(id, done){
    for(let i=0; i<users.length; i++){
        let user = users[i];
        if(user.username === id){
            return done(null, user);
        }
    }
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        let uname = username;
        let pwd = password;

        for(let i=0; i<users.length; i++){
            let user = users[i]
            if(uname === user.username) {
                return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
                    if(hash === user.password){
                        done(null, user);
                    } else {
                        done(null, false);
                    }
                })
            }
        }
        done(null, false);
    }
));

app.post(
    '/auth/login',
    passport.authenticate(
        'local',
        {
            successRedirect: '/welcome',
            failureRedirect: '/auth/login',
            failureFlash: false
        }
    )
);

app.post('/auth/register', function(req, res) {
    hasher({password: req.body.password}, function(err, pass, salt, hash){
        let user = {
            username:req.body.username,
            password:hash,
            salt: salt,
            displayName:req.body.displayName
        };
        users.push(user);
        req.login(user, function(err){
            req.session.save(function(){
                res.redirect('/welcome');
            });
        })
    });
});

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
});

app.listen(3003, function(){
    console.log('Connected 3003 port !!');
});
