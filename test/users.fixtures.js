const knex = require('knex')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

/**
 * create a knex instance connected to postgres
 * @returns {knex instance}
 */
function makeKnexInstance() {
  return knex({
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL,
  })
}

/**
 * create a knex instance connected to postgres
 * @returns {array} of user objects
 */
function makeUsersArray() {
    return [
        {
            id: 1,
            username: 'test-user-1',
            first_name: 'Test1',
            last_name: 'User1',
            password: 'password',
            email: 'testuser1@email.com'
        },
        {
            id: 2,
            username: 'test-user-2',
            first_name: 'Test2',
            last_name: 'User2',
            password: 'password',
            email: 'testuser2@email.com'
        },
    ]
}

function makeUserPostsArray() {
  return [
    {
      id: 1,
      title: 'Test Post 1',
      content: 'Test content for Post 1. Lorem ipsum, etc.',
      date_published: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 2,
      title: 'Test Post 2',
      content: 'Test content for Post 2. We are thinking of lorem ipsum again.',
      date_published: '2100-05-22T16:28:32.615Z'
    },
    {
      id: 3,
      title: 'Test Post 3',
      content: 'Test content for Post 3. Any more lorem ipsum available?',
      date_published: '1919-12-22T16:28:32.615Z'
    },
  ];
};

/**
 * make a bearer token with jwt for authorization header
 * @param {object} user - contains `id`, `username`
 * @param {string} secret - used to create the JWT
 * @returns {string} - for HTTP authorization header
 */
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({user_id: user.id}, secret, {
        subject: user.username,
        algorithm: 'HS256',
    })
    return `Bearer ${token}`
}

/**
 * remove data from tables and reset sequences for SERIAL id fields
 * @param {knex instance} db
 * @returns {Promise} - when tables are cleared
 */
function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        "users"`
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('users_id_seq', 0)`),
        ])
      )
  )
}

/**
 * insert users into db with bcrypted passwords and update sequence
 * @param {knex instance} db
 * @param {array} users - array of user objects for insertion
 * @returns {Promise} - when users table seeded
 */
function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.transaction(async trx => {
    await trx.into('users').insert(preppedUsers)

    await trx.raw(
      `SELECT setval('users_id_seq', ?)`,
      [users[users.length - 1].id],
    )
  })
}

module.exports = {
  makeKnexInstance,
  makeUsersArray,
  makeAuthHeader,
  cleanTables,
  seedUsers,
  makeUserPostsArray,
}