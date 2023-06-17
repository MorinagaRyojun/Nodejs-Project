const router = require('express').Router();
const account = require('./account');
const { authen } = require('../configs/security');
// Account route
router.use('/account', account);
// Equipment route มีการกำหนด authen ท่ายังไม่ Login ห้ามเรียกใช้
router.use('/equipment', authen, require('./equipment'));

module.exports = router;