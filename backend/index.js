const express = require('express')

const userService  = require('./service/userService')
const app = express()
const bodyParser = require('body-parser')
var multer = require('multer');
var path = require('path');

app.use('/static', express.static(__dirname + '/public'));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : false}))
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});




var storage = multer.diskStorage({
  // destination
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, "IMG_"+Date.now()+path.extname(file.originalname));
  }
});
var upload = multer({ storage: storage });




app.get('/', function (req, res) {
  res.send('Welcome to User Service APIs.')
})


app.post('/api/addUser',upload.single("photo"), function (req, res) {
  let userServiceObj = new userService(req, res)
  
  userServiceObj.addUser()
})

app.post('/api/updateUser',upload.single("photo"), function (req, res) {
  let userServiceObj = new userService(req, res)
 
  userServiceObj.updateUser()
})

app.get('/api/getUser', function (req, res) {
  let userServiceObj = new userService(req, res)
  userServiceObj.getUser()
})


app.post('/api/deleteUser', function (req, res) {
  let userServiceObj = new userService(req, res)
  userServiceObj.deleteUser()
})


app.get('/api/searchUser', function (req, res) {
  let userServiceObj = new userService(req, res)
  userServiceObj.searchUser()
})

app.listen(3000, function () {
  console.log('Oyeaa my first project on port 3000!')
})
