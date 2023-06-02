const express = require('express');
const server = express();
const expressSsession = require('express-session')
const bodyParser = require('body-parser');
const router = require('./routes');
const middleware = require('./configs/middleware')
const PORT = 3000;

//ใช้ตั้วค่า Session ในระบบ
server.use(expressSsession({
    secret: 'RyojunDev',
    resave: false,
    saveUninitialized: true,
    cookie: {}
  }))

// ตั้งค่า bodyParser สำหรับ Parse ตัวแปร
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());


// สร้าง Custom function Middleware มาใช้จัดการ Errors ต่างๆ
server.use(middleware);
// เรียนกใช้ routes
server.use('/api', router);

server.get('*', (req,res) => {
    res.end('<h1>Backend is started.</h1>')
})

server.listen(PORT, () => console.log(`Server is started ${PORT}.`))