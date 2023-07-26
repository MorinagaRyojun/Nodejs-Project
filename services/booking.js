
const connection = require("../configs/database");
const config = require('../configs');
const table = {
    bk: 'tb_bookings',
    bkeq: "tb_bookings_has_tb_equipments"
}
module.exports = {
    findByCheckDateTime({ bk_time_start, bk_time_end, tb_rooms_r_id }) {
        return new Promise((resolve, reject) => {
            const start = new Date(bk_time_start).toLocaleString();
            const end = new Date(bk_time_end).toLocaleString();
            connection.query(`
                SELECT COUNT(*) AS bk_count
                FROM ${table.bk}
                WHERE 
                    tb_rooms_r_id = ${tb_rooms_r_id}
                AND
                    (
                        bk_time_start BETWEEN ${connection.escape(start)} AND ${connection.escape(end)}
                        OR
                        bk_time_end BETWEEN ${connection.escape(start)} AND ${connection.escape(end)}
                    )
                `, (error, result) => {
                    if (error) return reject(error);

                    resolve(result.length > 0 ? result[0].bk_count > 0 : false);
                })
        });
    },
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

            // ตรวจสอบวันว่ามีการจองวันที่เลือกไปแล้วหรือยังในระบบ
            this.findByCheckDateTime(value)
                .then(checkInvalid => {
                    if (checkInvalid)
                        throw new Error('Cannot add this datetime please check again.');

                    connection.beginTransaction(tsError => {
                        if (tsError) return reject(tsError);

                        // บันข้อมูลเข้าสู่ตาราง tb_bookings
                        const bkModel = {
                            bk_title: value.bk_title,
                            bk_detail: value.bk_detail,
                            bk_time_start: new Date(value.bk_time_start),
                            bk_time_end: new Date(value.bk_time_end),
                            tb_users_u_id: value.tb_users_u_id,
                            tb_rooms_r_id: value.tb_rooms_r_id
                        };

                        // ตรวจสอบว่าวันที่เริ่ม น้อยกว่าวันที่สิ้นสุด
                        if (bkModel.bk_time_start >= bkModel.bk_time_end) {
                            return reject(new Error('The start date must be more than end date.'));
                        }

                        connection.query(`INSERT INTO ${table.bk} SET ?`, bkModel, (bkError, bkResult) => {
                            if (bkError) {
                                connection.rollback();
                                return reject(bkError);
                            }

                            // บันทึกข้อมูลเข้าสู่ตาราง tb_bookings_has_tb_equipments
                            const tb_bookings_bk_id = bkResult.insertId;
                            const bkeqModel = [];
                            value.equipments.forEach(tb_equipments_eq_id => bkeqModel.push([
                                tb_bookings_bk_id, tb_equipments_eq_id
                            ]));

                            // หากว่าไม่มีการเลือกอุปกรณ์ห้องประชุม
                            if (bkeqModel.length <= 0)
                                return connection.commit(cmError => {
                                    if (cmError) {
                                        connection.rollback();
                                        return reject(cmError);
                                    }
                                    resolve(bkResult);
                                });

                            connection.query(`INSERT INTO ${table.bkeq} (tb_bookings_bk_id, tb_equipments_eq_id) VALUES ?`, [bkeqModel], (bkeqError, bkeqResult) => {
                                if (bkeqError) {
                                    connection.rollback();
                                    return reject(bkeqError);
                                }
                                connection.commit(cmError => {
                                    if (cmError) {
                                        connection.rollback();
                                        return reject(cmError);
                                    }
                                    resolve(bkeqResult);
                                });
                            });
                        });
                    });
                })
                .catch(reject);
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