const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/api/hello', (req, res) => {
    res.send({message: 'Hello Express!'});
});

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: conf.host,
  user: conf.user,
  password: conf.password,
  port: conf.port,
  database: conf.database
});
connection.connect();

const multer = require('multer');
const upload = multer({dest : './upload'});


app.get('/api/customers_old', (req, res) => {
  res.send([
       {
          'id' : 1,
          'image' : 'https://placeimg.com/64/64/1',
          'name' : '홍길동',
          'birthday' : '961222',
          'gender' : '남자',
          'job' : '대학생'
        },
        {
          'id' : 2,
          'image' : 'https://placeimg.com/64/64/2',
          'name' : '이순신',
          'birthday' : '991222',
          'gender' : '남자',
          'job' : '대학생'
        },
        {
          'id' : 3,
          'image' : 'https://placeimg.com/64/64/3',
          'name' : '강감찬',
          'birthday' : '941222',
          'gender' : '여자',
          'job' : '디자이너'
        }
  ])
});

app.get('/api/customers', (req, res) => {
    connection.query(
      "select * from customers where isDeleted = 0",
      (err, rows, fields) => {
        res.send(rows);
      }
    );
    //res.send();
});

app.use('/image', express.static('./upload'));
app.post('/api/customers', upload.single('image'), (req, res) => {
    let sql = 'insert into customers(id, image, name, birthday, gender, job, createdDate, isDeleted) \
               values(null, ?,?,?,?,?, now(), 0)';
    let image = '/image/' + req.file.filename;
    let name = req.body.name;
    let birthday = req.body.birthday;
    let gender = req.body.gender;
    let job = req.body.job;
    let params = [image, name, birthday, gender, job];

    connection.query(sql, params, 
      (err, rows, fields) => {
        res.send(rows);
        console.log(err);
        console.log(rows);
      }
    );
    
});

app.delete('/api/customers/:id', (req, res) => {
  let sql = 'update customers set isDeleted = 1 where id = ?';
  let params = [req.params.id];
  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
    }
  );
});

app.listen(port, () => console.log(`Listening on port ${port}`));