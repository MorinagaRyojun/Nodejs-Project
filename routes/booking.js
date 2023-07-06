const router = require('express').Router();
const { check, query } = require('express-validator');
const roomService = require('../services/room');

router.get('/',[query('page').isInt()], async (req,res) => {
    try {
        req.validate();
        res.json(await roomService.find(req.query));
    } catch(ex) {
        res.errorEx(ex);
    }
    
})

module.exports = router;