// routes.js
const express = require('express');
const { createSession } = require('../controller/controller');

const router = express.Router();

router.post('/create-session', createSession);

module.exports = router;
