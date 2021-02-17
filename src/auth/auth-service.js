const crypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

const AuthService = {
    getUserWithUsername(db, username) {
        return db('users')
            .where({username})
            .first()
    },

    comparePass(password, hash) {
        return crypt.compare(password, hash)
    },

    createJwt(subject, payload) {
        return jwt.sign(payload, config.JWT_SECRET, {
            subject,
            expiresIn: config.JWT_EXPIRY,
            algorithm: 'HS256'
        })
    },

    verify(token) {
        return jwt.verify(token, config.JWT_SECRET, {
            algorithms: ['HS256']
        })
    }
}

module.exports = AuthService