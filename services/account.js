const connection = require("../configs/database");
const { password_hash, password_verify } = require('../configs/security')

module.exports = {
    onRegister(value) {
        return new Promise((resolve,reject) =>{
            value.u_password = password_hash(value.u_password);
            connection.query('INSERT INTO tb_users SET ?', value, (error, result) => {
                if(error) return reject(error);
                resolve(result);
            })
        })
    },
    onLogin(value) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM tb_users WHERE u_username=?',[value.u_username], (error,result) =>{
                if (error) return reject(error);
                if (result.length > 0) {
                    const userLogin = result[0];
                    if (password_verify(value.u_password, userLogin.u_password)) {
                        delete userLogin.u_password;
                        delete userLogin.u_created;
                        delete userLogin.u_updated;
                        return resolve(userLogin);
                    }
                }
                reject(new Error('Invalid username or password'));
            });
        })
    }
}