const router = require('express').Router();
const { check, query } = require('express-validator');
const roomService = require('../services/room');

//แสดงรายการห้องประชุม
router.get('/',[query('page').isInt()], async (req,res) => {
    try {
        req.validate();
        res.json(await roomService.find(req.query));
    } catch(ex) {
        res.errorEx(ex);
    }
    
});
//ทำถึงตรงนี้เดียวทำต่อ
router.post('/',(req,res) => {
    res.json()
})

module.exports = router;