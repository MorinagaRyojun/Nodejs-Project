const router = require('express').Router();
const service = require('../services/equipment');
const { check } = require('express-validator');
const base64Img = require('base64-img');
const fs = require('fs');
const path = require('path');
const uploadDir = path.resolve('uploads');
const equipDir = path.join(uploadDir,'equipments')

router.get('/', (req,res) => {
    res.json({message: 'GET Equipment Page'})
})

// Api สำหรับเพิ่มข้อมูล และ Add รูปภาพ
router.post('/',[
    check('eq_name').not().isEmpty(),
    check('eq_image').not().isEmpty(),
], async (req,res) => {
    try {
        req.validate();
        // ตรวจสอบ Dir ท่าไม่มีให้าร้างใหม่ 
        if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        if(!fs.existsSync(equipDir)) fs.mkdirSync(equipDir);
        // เปลงข้อมูลรูปภาพ
        req.body.eq_image = base64Img.imgSync(req.body.eq_image, equipDir, `equip-${Date.now()}`).replace(`${equipDir}/`, '');
        res.json({ message: await service.onCreate(req.body)});
    } catch (ex) {
        const FileImgPath = path.join(equipDir, req.body.eq_image);
        if (fs.existsSync(FileImgPath)) fs.unlinkSync(FileImgPath);
        res.errorEx(ex);
    }  
});

router.delete('/:id', async (req, res) => {
    try {
        const item = await service.findValue({eq_id: req.params.id});
        if (!item) throw new Error('Not found item.');
        const deleteItem = await service.onDelete(item.eq_id);
        const deleteImg = path.join(equipDir, item.eq_image);
        if (fs.existsSync(deleteImg)) fs.unlinkSync(deleteImg);
        res.send(deleteItem)
    } catch (error){
        res.errorEx(error);
    }
})
module.exports = router;