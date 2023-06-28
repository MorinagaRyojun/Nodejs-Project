const router = require('express').Router();
const service = require('../services/room');
const { check, query } = require('express-validator');
const base64Img = require('base64-img');
const fs = require('fs');
const path = require('path');
const uploadDir = path.resolve('uploads');
const roomDir = path.join(uploadDir,'room')

router.get('/', (req,res) => {
    res.json("This is Room.");
})

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
        // if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        // if(!fs.existsSync(roomDir)) fs.mkdirSync(roomDir);

         // เปลงข้อมูลรูปภาพ
        //  req.body.r_image = base64Img.imgSync(req.body.r_image, roomDir, `room-${Date.now()}`).replace(`${roomDir}/`, '');
        res.json({ message: await service.onCreateRoom(req.body)});

    } catch(ex) {
        const FileImgPath = path.join(roomDir, req.body.r_image || '');
        if (fs.existsSync(FileImgPath)) fs.unlinkSync(FileImgPath);
        res.errorEx(ex);
    }
})
module.exports = router;