const router = require('express').Router();
const { check, query, param } = require('express-validator');
const roomService = require('../services/room');
const bookingService = require("../services/booking");
const { isInRole } = require('../configs/security');

//แสดงรายการห้องประชุม
router.get('/',[query('page').isInt()], async (req,res) => {
    try {
        req.validate();
        res.json(await roomService.find(req.query));
    } catch(ex) {
        res.errorEx(ex);
    }
    
});

// แสดงประวัติการจองห้องประชุม
router.get('/history', [
    query('page').isInt()
], async (req, res) => {
    try {
        req.validate();
        res.json(await bookingService.findHistory(
            req.query,
            req.session.userLogin.u_id
        ));
    }
    catch (ex) { res.errorEx(ex); }
});

// แสดงรายละเอียดของห้องประชุม
router.get('/room/:id', async (req, res) => {
    try {
        const model = await roomService.findDetailForBooking(req.params.id);
        if (!model) throw new Error('Not found item.');
        res.json(model);
    }
    catch (ex) { res.errorEx(ex); }
});

//เพิ่มการจองห้องประชุม
router.post('/',[
    check('tb_rooms_r_id').isInt(),
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
        req.body.tb_users_u_id = req.session.userLogin.u_id;
        res.json( await bookingService.onCreate(req.body));
    } catch (ex) {
        res.errorEx(ex);
    }
});

//ดึงข้อมูลห้องประชุมมาทำ Select
router.get('/rooms/select', async (req,res) => {
    try {
        res.json(await roomService.findSelect());
    } catch(ex) {
        res.errorEx(ex);
    }
});



//#region สำหรับ Admin

//ดึงข้อมูลการจองห้องประชุมจาก Room Id มาใส่ใน Calendar
router.get('/calendar/room/:id', isInRole(['admin']), [
    param('id').isInt()
], async (req,res) => {
    try {
        req.validate();
        res.json(await bookingService.findByRoomId(req.params.id));
    } catch(ex) {
        res.errorEx(ex);
    }
});

// แสดงรายการจจองห้องประชุม
router.get('/manage', isInRole(['admin']), [query('page').isInt()], async (req,res) => {
    try {
        req.validate();
        res.json(await bookingService.find(req.query));
    } catch(ex) {
        res.errorEx(ex);
    }
});

// แก้ไขสถานะการจองเป็น อนุมัติ กับ ไม่อนุมัติ
router.put('/manage/:id', isInRole(['admin']), [
    param('id').isInt(),
    check('bk_status').isIn(['allowed', 'not allowed'])
], async (req, res) => {
    try {
        req.validate();
        const findItem = await bookingService.findById(req.params.id);
        if (!findItem) throw new Error('Not found item.');
        res.json(await bookingService.onUpdate(findItem.bk_id, req.body));
    }
    catch (ex) { res.errorEx(ex); }
});

// ลบรายข้อมูลห้องประชุม
router.delete('/manage/:id', isInRole(['admin']), [param('id').isInt()], async (req, res) => {
    try {
        req.validate();
        const findItem = await bookingService.findById(req.params.id);
        if (!findItem) throw new Error('Not found item.');
        res.json(await bookingService.onDelete(findItem.bk_id));
    }
    catch (ex) { res.errorEx(ex); }
});
//#endregion

module.exports = router;