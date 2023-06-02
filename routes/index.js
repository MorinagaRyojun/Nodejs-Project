const router = require('express').Router();
const account = require('./account');

router.use('/account', account);

module.exports = router;