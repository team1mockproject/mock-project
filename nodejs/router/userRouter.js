const express = require('express');
const router = express.Router();
const {createUser,loginUser} = require('../controller/userController');
router.post('/', createUser)
router.post('/login', loginUser)
module.exports = router;