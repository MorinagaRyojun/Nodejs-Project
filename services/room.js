const connection = require("../configs/database");
const table = 'tb_rooms'
module.exports = {
    findSelect() {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT r_id, r_name FROM ${table}`, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            })
        })
    },
    findDetail(id) {
        return new Promise((resolve,reject) => {
            connection.query(`
            SELECT 
                r_id,
                r_image,
                r_name,
                r_capacity,
                (SELECT COUNT(*) FROM tb_bookings WHERE tb_rooms_r_id = r_id AND bk_status = 'pending') as r_booking,
                r_detail
            FROM ${table}
            WHERE r_id = ?`, [id],(error,result) => {
                if (error) return reject(error);
                resolve(result.length > 0 ? result[0] : null);
            })
        })
    },
    find(value) {
        return new Promise((resolve,reject) => {
            const limitPage = 3;
            const startPage = (((value.page || 1) - 1) * limitPage)
            const sqls = {
                count: `SELECT COUNT(*) as row_count FROM ${table}`,
                select: `SELECT * FROM ${table}`
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
    findRoom(column) {
        return new Promise((resolve,reject) => {
            connection.query(`SELECT * FROM ${table} WHERE ?`,column,(error,result) => {
                if (error) return reject(error);
                resolve(result.length > 0 ? result[0] : null);
            })
        })
    },
    onCreateRoom (value) {
        return new Promise((resolve, reject) => {
            connection.query(`INSERT INTO ${table} SET ?`, value, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            })
        })
    },
    onDeleteRoom (id) {
        return new Promise((resolve,reject) => {
            connection.query(`DELETE FROM ${table} WHERE r_id=?`, [id], (error,result) =>{
                if(error) return reject(error);
                resolve(result);
            })
        })
    },
    onUpdate (id, value) {
        return new Promise((resolve,reject) => {
            const $query = `UPDATE ${table} SET
                r_image = ?,
                r_name = ?,
                r_capacity = ?,
                r_detail = ?
            WHERE r_id = ?
            `
            connection.query($query,[
                value.r_image,
                value.r_name,
                value.r_capacity,
                value.r_detail,
                id
            ], (error,result) => {
                if (error) return reject(error);
                resolve(result);
            })
        })
    }
}