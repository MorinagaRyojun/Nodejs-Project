const router = require('express').Router();
const service = require('../services/room');
const { check, query } = require('express-validator');
const base64Img = require('base64-img');
const fs = require('fs');
const path = require('path');
const uploadDir = path.resolve('uploads');
const roomDir = path.join(uploadDir,'room')


router.get('/', [
    query('page').not().isEmpty().isInt().toInt()
], async (req,res) => {
    try {
        req.validate();
        res.json( await service.find(req.query));
    } catch (ex) {
        res.errorEx(ex);
    }
})

// แสดงข้อมูล 1 Recode
router.get('/:id', async (req,res) => {
    try {
        const room = await service.findRoom({r_id : req.params.id});
        if (!room) throw new Error('Not found room.')
        room.r_image = base64Img.base64Sync(path.join(roomDir, room.r_image));
        res.json(room);
    } catch (ex) {
        res.errorEx(ex);
    }
});

//เพิ่มข้อมูลการจองห้อง
router.post('/',[
    check('r_image').not().isEmpty(),
    check('r_name').not().isEmpty(),
    check('r_capacity').isInt(),
    check('r_detail').exists(),
], async(req,res) => {
    try {
        req.validate();

        // ตรวจสอบ Dir ท่าไม่มีให้าร้างใหม่ 
        if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        if(!fs.existsSync(roomDir)) fs.mkdirSync(roomDir);

        // เปลงข้อมูลรูปภาพ
        req.body.r_image = base64Img.imgSync(req.body.r_image, roomDir, `room-${Date.now()}`).replace(`${roomDir}/`, '');
        res.json({ message: await service.onCreateRoom(req.body)});

    } catch(ex) {
        const FileImgPath = path.join(roomDir, req.body.r_image || '');
        if (fs.existsSync(FileImgPath)) fs.unlinkSync(FileImgPath);
        res.errorEx(ex);
    }
})

//ลยข้อมูลห้องประชุม
router.delete('/:id', async (req,res) => {
    try {
        const room = await service.findRoom({r_id: req.params.id});
        if (!room) throw new Error('Not found room');
        const deleteRoom = await service.onDeleteRoom(room.r_id);
        const deleteImg = path.join(roomDir, room.r_image);
        if (fs.existsSync(deleteImg)) fs.unlinkSync(deleteImg);
        res.json(deleteRoom);
    } catch(ex) {
        res.errorEx(ex);
    }
})

router.put('/:id',[
    check('r_image').not().isEmpty(),
    check('r_name').not().isEmpty(),
    check('r_capacity').isInt(),
    check('r_detail').exists(),
], async(req,res) => {
    try {
        req.validate();

        const room = await service.findRoom({r_id: req.params.id});
        if(!room) throw new Error('Room not found');

        // ตรวจหา Dir ของรูป หากไม่มีให้ทำการสร้างไว้ด้วย
        if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        if(!fs.existsSync(roomDir)) fs.mkdirSync(roomDir);
        // เปลี่ยน Base64 ให้กลายเป็นไฟล์ภาพ แล้วเก็บชื่อเอาไว้
        req.body.r_image = base64Img.imgSync(req.body.r_image, roomDir, `room-${Date.now()}`).replace(`${roomDir}/`, '');

        const upadteItem = await service.onUpdate(room.r_id,req.body);

        //ตรวจสอบว่าแก้ข้อมูลสำเร็จหรือไม่ ท่าสำเร็จให้ลบรูปเก่าออกด้วย
        if (upadteItem.affectedRows > 0) {
            const deleteImg = path.join(roomDir, room.r_image);
            if (fs.existsSync(deleteImg)) fs.unlinkSync(deleteImg);
        }
        res.json(upadteItem);
    } catch(ex) {
        res.errorEx(ex);
    }
})
module.exports = router;