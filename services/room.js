const connection = require("../configs/database");
module.exports = {
    onCreateRoom (value) {
        return new Promise((resolve, reject) => {
            resolve(value)
            // connection.query('INSERT INTO tb_equipments SET ?')
        })
    }
}