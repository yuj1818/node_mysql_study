let express = require('express');
let cookieParser = require('cookie-parser');
let app = express();
app.use(cookieParser('2E!4A#3d%4T5a%34E4!@#4ds!Asd#$'));

//실습용으로 데이터베이스 대신 배열 사용
let products = {
    1:{title:'The history of web 1'},
    2:{title:'The next web'}
}

app.get('/count', function(req, res){
    let count = 0;
    if(req.signedCookies.count) {
        count = parseInt(req.signedCookies.count);
    }
    count = count + 1;
    res.cookie('count', count, {signed:true});
    res.send('count : '+ count);
})

app.get('/products', function(req, res){
    let output = '';
    for( let name in products){
        output += `
            <li>
                <a href="/cart/${name}">${products[name].title}</a>
            </li>
            `;
    }
    res.send(`<h1>Products</h1><ul>${output}</ul><a href="/cart">Cart</a>`);
});

app.get('/cart/:id', function (req,res){
    let id = req.params.id;
    let cart = {};
    if(req.signedCookies.cart){
        cart = req.signedCookies.cart;
    }
    if(!cart[id]){
        cart[id] = 0;
    }
    cart[id] = parseInt(cart[id])+1;
    res.cookie('cart', cart, {signed:true});
    res.redirect('/cart');
});

app.get('/cart', function(req, res){
    let cart = req.signedCookies.cart;
    let output = '';
    if(!cart){
        res.send('Empty');
    } else {
        for(let id in cart){
            output += `<li>${products[id].title} (${cart[id]})</li>`;
        }
    }
    res.send(`
        <h1>Cart</h1>
        <ul>${output}</ul>
        <a href="/products">Products List</a>`);
})

app.listen(3003, function(){
    console.log('Connected 3003 port !!');
});
