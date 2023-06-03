const router = require('express').Router();
const { check } = require('express-validator')
const { onRegister } = require('../services/account');

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
        res.json(created)
    } catch (error){
        // res.status(400).json({ message: error})
        res.errorEx(error)
    }
    
})

module.exports = router;