
const connection = require("../configs/database");
const config = require('../configs');
const table = {
    bk: 'tb_bookings',
    bkeq: "tb_bookings_has_tb_equipments"
}
module.exports = {
    findById(id) {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM ${table.bk} WHERE bk_id = ?`, [id], (error, result) => {
                if (error) return reject(error);
                resolve(result.length > 0 ? result[0] : null);
            });
        });
    },
    findByRoomId(id) {
        return new Promise((resolve, reject) => {
            connection.query(`
            Select *
            FROM ${table.bk}
            WHERE tb_rooms_r_id = ?
            AND bk_status <> 'not allowed'`, [id], (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    },

    findHistory(value, tb_users_u_id) {
        return new Promise((resolve, reject) => {
            const limitPage = config.limitPage;
            const startPage = ((value.page || 1) - 1) * limitPage;
            const sqls = {
                count: `SELECT COUNT(*) AS rows FROM ${table.bk} WHERE tb_users_u_id = ${connection.escape(tb_users_u_id)}`,
                select: `SELECT * FROM ${table.bk} WHERE tb_users_u_id = ${connection.escape(tb_users_u_id)}`
            };

            if (value.search_key && value.search_text) {
                const key = value.search_key;
                const txt = value.search_text;
                const sqlSerch = ` AND ${connection.escapeId(key)} LIKE ${connection.escape(`%${txt}%`)}`;
                sqls.count += sqlSerch;
                sqls.select += sqlSerch;
            }

            // เรียงลำดับข้อมูล
            sqls.select += ' ORDER BY bk_created DESC';

            // หาจำนวนแถว
            connection.query(sqls.count, (error, result) => {
                if (error) return reject(error);
                const items = { result: [], rows: result[0].rows, limit: limitPage };

                // แบ่งหน้า page
                sqls.select += ` LIMIT ${connection.escape(startPage)},${limitPage}`;
                connection.query(sqls.select, (error, result) => {
                    if (error) return reject(error);
                    items.result = result;
                    resolve(items);
                });
            });
        });
    },
    find(value) {
        return new Promise((resolve, reject) => {
            const limitPage = config.limitPage;
            const startPage = ((value.page || 1) - 1) * limitPage;
            const sqls = {
                count: `SELECT COUNT(*) AS rows FROM ${table.bk}`,
                select: `SELECT * FROM ${table.bk}`
            };

            if (value.search_key && value.search_text) {
                const key = value.search_key;
                const txt = value.search_text;
                const sqlSerch = ` WHERE ${connection.escapeId(key)} LIKE ${connection.escape(`%${txt}%`)}`;
                sqls.count += sqlSerch;
                sqls.select += sqlSerch;
            }

            // เรียงลำดับข้อมูล
            sqls.select += ' ORDER BY bk_created DESC';

            // หาจำนวนแถว
            connection.query(sqls.count, (error, result) => {
                if (error) return reject(error);
                const items = { result: [], rows: result[0].rows, limit: limitPage };

                // แบ่งหน้า page
                sqls.select += ` LIMIT ${connection.escape(startPage)},${limitPage}`;
                connection.query(sqls.select, (error, result) => {
                    if (error) return reject(error);
                    items.result = result;
                    resolve(items);
                });
            });
        });
    },
    
    onCreate(value) {
        return new Promise((resolve, reject) => {
            connection.beginTransaction(err => {
                if(err) return reject(err);
                const bkModel = {
                    bk_title: value.bk_title,
                    bk_detail: value.bk_detail,
                    bk_time_start: new Date(value.bk_time_start),
                    bk_time_end: new Date(value.bk_time_end),
                    tb_users_u_id: value.tb_users_u_id,
                    tb_rooms_r_id: value.tb_rooms_r_id
                };
                connection.query(`INSERT INTO ${table.bk} SET ?`, bkModel, (err, result) => {
                    if (err) {
                        connection.rollback();
                        return reject(err);
                    }
                    //บีนทึกข้อมูลการจองเข้าสู่ tb_bookings_has_tb_equipments
                    const tb_bookings_bk_id = result.insertId;
                    const bkeqModel = [];
                    value.equipments.forEach(tb_equipments_eq_id => {
                        bkeqModel.push([tb_bookings_bk_id, tb_equipments_eq_id])
                    });
                    connection.query(`INSERT INTO ${table.bkeq} (tb_bookings_bk_id, tb_equipments_eq_id) VALUES ?`, [bkeqModel], (err, result) => {
                        if (err) {
                            connection.rollback();
                            return reject(err);
                        }
                        connection.commit(err => {
                            if (err) {
                                connection.rollback();
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                });
            });

        });
    },
    onUpdate(id, value) {
        return new Promise((resolve, reject) => {
            value.bk_updated = new Date();
            connection.query(`
                UPDATE ${table.bk} 
                SET ? , bk_updated = now()
                WHERE bk_id = ${connection.escape(id)}`, value, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                })
        });
    },
    onDelete(id) {
        return new Promise((resolve, reject) => {
            connection.query(`DELETE FROM ${table.bk} WHERE bk_id = ?`, [id], (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    },
}