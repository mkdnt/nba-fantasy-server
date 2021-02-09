const express = require('express');
const AuthService = require ('./auth-service')
const { requireAuth } = require('../middleware/jwt-auth')

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter
    .route('/login')
    .post(jsonBodyParser, async (req, res, next) => {
        
    })


module.exports = authRouter