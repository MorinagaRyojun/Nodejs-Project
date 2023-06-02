const router = require('express').Router();
const { check, validationResult } = require('express-validator')

router.post('/register', [
    check('u_username').not().isEmpty(),
    check('u_password').not().isEmpty(),
    check('u_firstname').not().isEmpty(),
    check('u_lastname').not().isEmpty(),
], (req,res) => {
    try {
        req.validate();
        // validationResult(req).throw();
        res.json({ message: req.body })
    } catch (error){
        // res.status(400).json({ message: error})
        res.errorEx(error)
    }
    
})

module.exports = router;