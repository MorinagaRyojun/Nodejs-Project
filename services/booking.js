
const connection = require("../configs/database");
const table = {
    bk: 'tb_bookings',
    bkeq: "tb_bookings_has_tb_equipments"
}
module.exports = {
    
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
    }
}