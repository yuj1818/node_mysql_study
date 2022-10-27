let http = require('http');
let fs = require('fs');
let url = require('url');
let qs = require('querystring');
let template = require('./lib/template.js');
let path = require('path');
let sanitizeHtml = require('sanitize-html');
let mysql = require('mysql');
let db = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: '111111',
    database: 'opentutorials'
});
db.connect();

let app = http.createServer(function(request,response){
    let _url = request.url;
    let queryData = url.parse(_url, true).query;
    let pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
        if(queryData.id === undefined){
            db.query(`SELECT * FROM topic`, function(err, topics){
                let title = 'Welcome';
                let description = 'Hello, Node.js';
                let list = template.list(topics);
                let html = template.HTML(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        } else {
            db.query(`SELECT * FROM topic`, function(err, topics){
                if(err){
                    throw err;
                }
                db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function(err2, topic){
                    if(err2){
                        throw err;
                    }
                    let title = topic[0].title;
                    let description = topic[0].description;
                    let list = template.list(topics);
                    let html = template.HTML(title, list,
                        `
                        <h2>${title}</h2>
                        ${description}
                        <p>by ${topic[0].name}</p>
                        `,
                        `<a href="/create">create</a>
                                <a href="/update?id=${queryData.id}">update</a>
                                <form action="delete_process" method="post">
                                  <input type="hidden" name="id" value="${queryData.id}">
                                  <input type="submit" value="delete">
                                </form>`
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if(pathname === '/create'){
        db.query(`SELECT * FROM topic`, function(err, topics){
            db.query('SELECT * FROM author', function(err, authors){
                let title = 'Create';
                let list = template.list(topics);
                let html = template.HTML(title, list,
                    `<form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        ${template.authorSelect(authors)}
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        })
    } else if(pathname === '/create_process'){
        let body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            let post = qs.parse(body);
            db.query(`INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
                [post.title, post.description, post.author],
                function(err, results){
                    if(err){
                        throw err;
                    }
                    response.writeHead(302, {Location: `/?id=${results.insertId}`});
                    response.end();
                }
            );
        });
    } else if(pathname === '/update'){
        db.query('SELECT * FROM topic', function(err, topics){
            if(err){
                throw err;
            }
            db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function(err2, topic){
                if(err2){
                    throw err2;
                }
                db.query('SELECT * FROM author', function(err3, authors){
                    if(err3){
                        throw err3;
                    }
                    let list = template.list(topics);
                    let html = template.HTML(topic[0].title, list,
                        `
                        <form action="/update_process" method="post">
                          <input type="hidden" name="id" value="${topic[0].id}">
                          <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                          <p>
                            <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                          </p>
                          <p>
                            ${template.authorSelect(authors, topic[0].author_id)}                          
                          </p>
                          <p>
                            <input type="submit">
                          </p>
                        </form>
                    `,
                        `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        });
    } else if(pathname === '/update_process'){
        let body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            let post = qs.parse(body);
            db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,[post.title, post.description, post.author, post.id], function(err, results){
                if(err){
                    throw err;
                }
                response.writeHead(302, {Location: `/?id=${post.id}`});
                response.end();
            })
        });
    } else if(pathname === '/delete_process'){
        let body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            let post = qs.parse(body);
            db.query(`DELETE FROM topic WHERE id=?`,[post.id], function(err, results){
                if(err){
                    throw err;
                }
                response.writeHead(302, {Location: '/'});
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);
