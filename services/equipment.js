const connection = require("../configs/database");
module.exports = {
    onCreate(value) {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO tb_equipments SET ?', value, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    }
};