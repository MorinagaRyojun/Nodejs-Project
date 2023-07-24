const router = require('express').Router();
const { check, query } = require('express-validator');
const roomService = require('../services/room');
const bookingService = require("../services/booking");


//แสดงรายการห้องประชุม
router.get('/',[query('page').isInt()], async (req,res) => {
    try {
        req.validate();
        res.json(await roomService.find(req.query));
    } catch(ex) {
        res.errorEx(ex);
    }
    
});
//เพิ่มการจองห้องประชุม
router.post('/',[
    check('bk_title').not().isEmpty(),
    check('bk_detail').not().isEmpty(),
    check('bk_time_start').custom(value => {
        return !isNaN(Date.parse(value)) //ตรวจว่าเป็น Date หรือไม่ ท่าไม่จะแสดงค่า False
    }),
    check('bk_time_end').custom(value => !isNaN(Date.parse(value))), //เหมือนอันบนแต่เขียนแบบสั้นลง
    check('equipments').custom(values => {
        const isArray = Array.isArray(values);
        if (isArray && values.length >0) {
            return values.filter(item => isNaN(item)).length == 0;
        }
        return isArray
    })
], async (req,res) => {
    try {
        req.validate();
        res.json( await bookingService.onCreate());
    } catch (ex) {
        res.errorEx(ex);
    }
})

module.exports = router;