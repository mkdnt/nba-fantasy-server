const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UserService = {
    getAllUsers(knex) {
        return knex.select('*').from('users')
    },
    getUserById(knex, id) {
        return knex.from('users').select('*').where('id', id).first()
    },
    hasUserWithUsername(db, username) {
        return db('users')
            .where({username})
            .first()
            .then(user => !!user)
    },
    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(([user]) => user)
    },
    validatePassword(password) {
        if (password.length < 8) {
            return 'Password must be 8 characters or longer'
        }
        if(password.length > 72) {
            return 'Password must be 72 characters or less'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
        }
        return null
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    serializeUser(user) {
        return {
            id: user.id,
            username: user.username,
            team_name: user.team_name,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
        }
    },
}

module.exports = UserService