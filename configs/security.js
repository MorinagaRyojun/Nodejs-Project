//เอาไว้กำหนดการเข้ารหัสต่างๆ ตัวที่ใช่ตอนนี้เป็นตัวอย่างการเข้าแบบ Basic

const crypto = require('crypto');

const security = {
    password_hash(password){
        return crypto.createHash('sha1').update(password).digest('hex');
    },
    password_verify(password, password_hash) {
        return security.password_hash(password) === password_hash;
    },
    // เอาไว้ตรวจว่ามีการ Login แล้วหรือยัง ท่ามี Next ท่าไม่ Error
    authen( req, res, next) {
        req.session.userLogin = {
            "u_id": 5,
            "u_username": "admin",
            "u_firstname": "tanyaboon",
            "u_lastname": "morinaga",
            "u_role": "admin"
        };
        try {
            if (req.session.userLogin) {
                return next();
            }
            throw new Error('Unauthoriza.');
        } catch (ex) {
            res.errorEx(ex, 401);
        }
    }
}

module.exports = security;