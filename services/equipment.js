const connection = require("../configs/database");
module.exports = {
    findValue(column){
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM tb_equipments WHERE ?', column, (error, result) => {
                if (error) return reject(error);
                resolve(result.length > 0 ? result[0] : null);
            })
        });
    },
    onCreate(value) {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO tb_equipments SET ?', value, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    },
    onDelete(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM tb_equipments WHERE eq_id=?', [id], (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    }
};