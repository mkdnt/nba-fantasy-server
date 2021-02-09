const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
        {
            id: 1,
            username: 'test-user-1',
            firstname: 'Test1',
            lastname: 'User1',
            password: 'password',
            email: 'testuser1@email.com'
        },
        {
            id: 2,
            username: 'test-user-2',
            firstname: 'Test2',
            lastname: 'User2',
            password: 'password',
            email: 'testuser2@email.com'
        },
    ]
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({user_id: user.id}, secret, {
        subject: user.username,
        algorithm: 'HS256',
    })
    return `Bearer ${token}`
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.transaction(async trx => {
    await trx.into('user').insert(preppedUsers)

    await trx.raw(
      `SELECT setval('user_id_seq', ?)`,
      [users[users.length - 1].id],
    )
  })
}

module.exports = {
    makeUsersArray,
    makeAuthHeader,
    seedUsers,
}