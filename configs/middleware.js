const { validationResult } = require('express-validator')

//เอาไว้ย่อตอนประกาศ Error และปรัยแต่ง Error เช็ค Validation ต่างๆ

/* 
Validayion ปกติ
validationResult(req).throw();
ลดรูปเหลือ req.validate()
*/

/* จากปกติ Error
res.status(400).json({ message: ex.errors[0]})
ให้เหลือแค่
res.errorEx(error)
หรือ res.errorEx(error, status)
*/

module.exports = function(req, res, next) {
    //ควจสอบ Validation แล้วสร้าง Error Massage แบบกำหนดรูปแบบเสรืมเอง
    req.validate = function() {
        const errors = validationResult(req).array();
        if(errors.length == 0) return;
        // console.log(errors)
        throw new Error(`${errors[0].path} : ${errors[0].msg}`)

    };

    //แสดงค่า Error
    res.errorEx = function (inputError, status = 400) {
        res.status(status).json( {message: inputError.message });
    };
    next();
};