const connection = require("../configs/database");
const table = {
    bk: 'tb_bookings',
    bkeq: "tb_bookings_has_tb_equipments"
}
module.exports = {
    onCreate(value) {
        return new Promise((resolve, reject) => {
            resolve(value);
        });
    }
}