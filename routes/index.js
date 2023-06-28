const router = require('express').Router();
const account = require('./account');
const { authen } = require('../configs/security');
// Account route
router.use('/account', account); // import Rout ทั่วไป เก็บไว้ในตัวแปลแล้วเอามาเรียกใช้
// Equipment route มีการกำหนด authen ท่ายังไม่ Login ห้ามเรียกใช้
router.use('/equipment', authen, require('./equipment')); // import Rout แบบเอามารวบไว้ในที่เดียว สามารถใช้ได้เหมือนกัน
// Room route
router.use('/rooms', authen, require('./room'));

module.exports = router;