var express = require('express');
var cors = require('cors');
var app = express();
var mysql = require('mysql');
const jwt = require('jsonwebtoken');
const secret = 'bananazaza';


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));
app.use(cors());

//create database connection
const conn = mysql.createConnection({
    host: 'mysql-bkcishere.alwaysdata.net',
    user: 'bkcishere',
    password: '0967956304z',
    database: 'bkcishere_samdb'
});
//connect to database
conn.connect((err) => {
    if (err) throw err;
    console.log('Mysql Connected...');
});

app.get('/asd', (req, res) => {
    res.send('Hello World');
});

//login api
app.post('/login', (req, res) => {
    const email = req.body.email
    const password = req.body.password

    if (email && password) {
        conn.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {

            if (results.length > 0) {
                var token = jwt.sign({ email: results[0].email }, secret, { expiresIn: '1h' });
                res.json({message: 'Login success', success: true, email: results[0].email, token});
            } else {
                res.send('Incorrect Username and/or Password!');
            }
        });
    } else {
		res.send('Please enter Username and Password!');
	}

});

//register api
app.post('/register', (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    conn.query('INSERT INTO users SET ?', {username: username, email: email, password: password}, function (error, results, fields) {
        if (error) throw error;
        res.send('User registered successfully.');
    });
});

//registertech api
app.post('/registertech', (req, res) => {
    const name = req.body.name
    const date = req.body.date
    const address = req.body.address
    const idcard = req.body.idcard
    const phonenum = req.body.phonenumber
    const type = req.body.type
    const exp = req.body.exp
    const cer = req.body.cer
    conn.query('INSERT INTO tech SET ?',{name: name, date: date, address: address, idcard: idcard, phonenumber:phonenum, type: type, exp: exp, cer: cer},function (error){
        if (error) throw error;
        res.send('Tech registered successfully')
    });
});

//getonetech api
app.get('/tech/:id', function (req, res, next) {
    const id = req.params.id
    conn.query(
          'SELECT * FROM tech WHERE techid = ?',
      [id],
      function(err,results) {
        res.json(results);
      }
    );
})

//getalltech api
app.get('/tech', function (req, res, next) {
    conn.query(
      'SELECT * FROM tech',
      function(err, results, fields) {
        res.json(results);
      }
    );
})

//getoneuser api
app.get('/users/:id', function (req, res, next) {
    const id = req.params.id;
    conn.query(
      'SELECT * FROM users WHERE userid = ?',
      [id],
      function(err, results) {
        res.json(results);
      }
    );
})

//getalluser api
app.get('/users', function (req, res, next) {
    conn.query(
      'SELECT * FROM users',
      function(err, results, fields) {
        res.json(results);
      }
    );
})

//checkusertoken api
app.get('/user', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (token) {
        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                conn.query('SELECT * FROM users WHERE email = ?', [decoded.email], function(error, results, fields) {
                    if (results.length > 0) {
                        res.json({message: 'Login success', success: true, userid: results[0].userid, email: results[0].email, username: results[0].username});
                    } else {
                        res.send('Incorrect Username and/or Password!');
                    }
                    res.end();
                });
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
})

//api innerjoin getall
app.get('/order:id', function (req,res) {
    const id = req.params.id
    conn.query(
        'SELECT orders.orderid,orders.date,orders.type,users.userid,users.username FROM orders INNER JOIN users ON orders.userid=users.userid WHERE orders.userid = users.userid',
        [id],function(error,results){
            if (error) throw error;
        res.json(results);
        }
    );
})

//api innerjoin get quotation
app.get('/quotation', function (req,res) {
    const id = req.params.id
    conn.query(
        'SELECT quotation.detail,quotation.amount,quotation.username,quotation.orderid,quotation.userid,quotation.techid,quotation.techname,orders.date FROM quotation INNER JOIN orders ON (quotation.orderid=orders.orderid) WHERE quotation.orderid=orders.orderid',
        [id],function(error,results){
            if (error) throw error;
        res.json(results);
        }
    );
})

//logout api
app.delete('/logout', (req, res) => {
    this.$auth.loggedIn = false;
    res.json({status: 'ok', message: 'Logout success'})
})

//Server listening
app.listen(3000, () => {
    console.log('Server started on port 3000...');
});
