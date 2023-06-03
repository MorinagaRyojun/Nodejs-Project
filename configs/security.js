//เอาไว้กำหนดการเข้ารหัสต่างๆ ตัวที่ใช่ตอนนี้เป็นตัวอย่างการเข้าแบบ Basic

const crypto = require('crypto');

module.exports = {
    password_hash(password){
        return crypto.createHash('sha1').update(password).digest('hex');
    }
}
