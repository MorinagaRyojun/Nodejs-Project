const router = require('express').Router();
const service = require('../services/equipment');
const { check, query } = require('express-validator');
const base64Img = require('base64-img');
const fs = require('fs');
const path = require('path');
const uploadDir = path.resolve('uploads');
const equipDir = path.join(uploadDir,'equipments')

//http://localhost:3000/api/equipment?page=1&search_key=eq_name&search_text=1
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
        const equipment = await service.findValue({eq_id : req.params.id});
        if (!equipment) throw new Error('Not found item.')
        equipment.eq_image = base64Img.base64Sync(path.join(equipDir, equipment.eq_image));
        res.json(equipment);
    } catch (ex) {
        res.errorEx(ex);
    }
});

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
        const FileImgPath = path.join(equipDir, req.body.eq_image || '');
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

router.put('/:id', [
    check('eq_name').not().isEmpty(),
    check('eq_detail').exists(),
    check('eq_image').not().isEmpty(),
], async(req,res) =>{
    try {
        req.validate();

        // ตรวจหาข้อมูลที่จะแก้
        const item = await service.findValue({ eq_id: req.params.id });
        if (!item) throw new Error('Not found item.');

        // ตรวจหา Dir ของรูป หากไม่มีให้ทำการสร้างไว้ด้วย
        if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        if(!fs.existsSync(equipDir)) fs.mkdirSync(equipDir);

        req.body.eq_image = base64Img.imgSync(req.body.eq_image, equipDir, `equip-${Date.now()}`).replace(`${equipDir}/`, '');
        const upadteItem = await service.onUpdate(req.params.id,req.body)
        
        // หากมีการส่ง Upadte รูป ให้ลบรูปเก่าด้วย
        if (upadteItem.affectedRows > 0) {
            const deleteImg = path.join(equipDir, item.eq_image);
            if (fs.existsSync(deleteImg)) fs.unlinkSync(deleteImg);
        }

        res.json({ upadteItem });
    } catch (ex) {
        const FileImgPath = path.join(equipDir, req.body.eq_image || '');
        if (fs.existsSync(FileImgPath)) fs.unlinkSync(FileImgPath);
        res.errorEx(ex);
    }
})
module.exports = router;