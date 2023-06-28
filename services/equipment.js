const connection = require("../configs/database");
module.exports = {
    // ค้นหาข้อมูล จาก Database จัดหน้า และทำการ Search
    find(value) {
        return new Promise((resolve,reject) => {
            const limitPage = 3;
            const startPage = (((value.page || 1) - 1) * limitPage)
            const sqls = {
                count: 'SELECT COUNT(*) as row_count FROM tb_equipments',
                select: 'SELECT * FROM tb_equipments'
            };

            if(value.search_key && value.search_text) {
                const key = value.search_key;
                const txt = value.search_text;
                const sql_Search = ` WHERE ${connection.escapeId(key)} LIKE ${connection.escape(`%${txt}%`)}`;
                sqls.count += sql_Search;
                sqls.select += sql_Search;
            }
            //หาจำนวนหน้า
            sqls.select += ` limit ${connection.escape(startPage)},${limitPage}`;
            connection.query(sqls.count, (error, result) => {
                if(error) return reject(error);
                const items = { result: [] , rows: result[0].row_count };
                // แบ่ง Page
                connection.query(sqls.select, (error, result) => {
                    if(error) return reject(error);
                    items.result = result;
                    resolve(items);
                })
                
            });
        })
    },

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
    },
    onUpdate(id, value) {
        return new Promise((resolve,reject) => {
            const $query = `
            UPDATE tb_equipments SET
                eq_name = ?,
                eq_detail = ?,
                eq_image = ?
            WHERE
                eq_id = ?
            `;
            connection.query($query, [
                value.eq_name,
                value.eq_detail,
                value.eq_image,
                id
            ], (error,result) => {
                if (error) return reject(error);
                resolve(result);
            })
        })
    }
};