const router = require('express').Router();
const { check } = require('express-validator')
const { onRegister, onLogin } = require('../services/account');

//API สำหรับลงทะเบียน http://localhost:3000/api/account/register
router.post('/register', [
    check('u_username').not().isEmpty(),
    check('u_password').not().isEmpty(),
    check('u_firstname').not().isEmpty(),
    check('u_lastname').not().isEmpty(),
], async(req,res) => {
    try {
        req.validate();
        // validationResult(req).throw();
        const created =  await onRegister(req.body);
        res.json(created);
    } catch (error){
        // res.status(400).json({ message: error})
        res.errorEx(error);
    }
    
});

//API สำหรับเข้าสู่ระบบ http://localhost:3000/api/account/login
router.post('/login', [
    check('u_username').not().isEmpty(),
    check('u_password').not().isEmpty()
], async(req, res) => {
    try {
        req.validate();
        const userLogin = await onLogin(req.body);
        req.session.userLogin = userLogin;
        res.json(userLogin);
    } catch(error) {
        res.errorEx(error);
    }
});

// router.get('/userLogin', (req, res) => {
//     res.json(req.session.userLogin);
// })

//ตรวจสอบ User Login Session
router.post('/getUserLogin', (req, res) => {
    try {
        if (req.session.userLogin) {
            return res.json(req.session.userLogin);
        }
        throw new Error('Unauthoriza.');
    } catch(ex) {
        res.errorEx(ex, 401);
    }
    
});

// Logout Session
router.post('/logout', (req, res) => {
    try {
        delete req.session.userLogin;
        res.json({ message: 'Logout' });
    } catch (error) {
        res.errorEx(error);
    }
});


module.exports = router;