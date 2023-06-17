const router = require('express').Router();
const base64Img = require('base64-img');
const fs = require('fs');
const path = require('path');
const uploadDir = path.resolve('uploads');
const equipDir = path.join(uploadDir,'equipments')

router.get('/', (req,res) => {
    res.json({message: 'GET Equipment Page'})
})

router.post('/', (req,res) => {
    try {
        // ตรวจสอบ Dir ท่าไม่มีให้าร้างใหม่ 
        if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        if(!fs.existsSync(equipDir)) fs.mkdirSync(equipDir);
        // เปลงข้อมูลรูปภาพ
        const fileImg = base64Img.imgSync(req.body.eq_image, equipDir, `equip-${Date.now()}`).replace(`${equipDir}/`, '');
        res.json({ message: fileImg});
    } catch (ex) {
        res.error(ex);
        res.json({message: 'POST Equipment Page'})
    }  
});

module.exports = router;