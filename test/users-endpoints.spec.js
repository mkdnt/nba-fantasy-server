const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makeUsersArray, makeAuthHeader, seedUsers } = require("./users.fixtures");
const bcrypt = require('bcryptjs');

describe('User Endpoints', function () {
  let db

  const testUsers = makeUsersArray()
  const testUser = testUsers[0]

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
  });

  before("clean the table", () => db('users').truncate());

  after("disconnect from db", () => db.destroy());

  afterEach("cleanup", () => db('users').truncate());

  describe(`POST /api/user`, () => {
    beforeEach("insert users", () => {
        return db.into('users').insert(testUsers);
      });

    const requiredFields = ['username', 'password', 'firstname', 'lastname', 'email']
    
    requiredFields.forEach(field => {
        const registerAttemptBody = {
            username: 'test username',
            password: 'test password',
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
        }

        it(`responds with 400 error when '${field}' is missing`, () => {
            delete registerAttemptBody[field]

            return supertest(app)
                .post('api/user')
                .send(registerAttempBody)
                .expect(400, {error: `Missing '${field}' in request body`})
        })
    })

    it(`responds with 400 and 'Password must be 8 characters or longer' when empty password`, () => {
        const userShortPassword = {
            username: 'test username',
            password: '1234567',
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
        }
        return supertest(app)
            .post('api/user')
            .send(userShortPassword)
            .expect(400, {error: 'Password must be 8 characters or longer'})
    })

    it(`responds with 400 and 'Password must be 72 characters or less' when long password`, () => {
        const userLongPassword = {
            username: 'test username',
            password: '*'.repeat(73),
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
        }
        return supertest(app)
            .post('api/user')
            .send(userLongPassword)
            .expect(400, {error: 'Password must be 72 characters or less'})
    })

    it(`responds with 400 when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
            username: 'test username',
            password: ' 1Aa!2Bb@',
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
        }
        return supertest(app)
            .post('/api/user')
            .send(userPasswordStartsSpaces)
            .expect(400, {error: 'Password must not start or end with empty spaces'})
    })

    it(`responds with 400 when password ends with spaces`, () => {
        const userPasswordEndsSpaces = {
            username: 'test username',
            password: '1Aa!2Bb@ ',
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
        }
        return supertest(app)
            .post('/api/user')
            .send(userPasswordEndsSpaces)
            .expect(400, {error: 'Password must not start or end with empty spaces'})
    })

    it(`responds with 400 when password isn't complex enough`, () => {
        const userPasswordNotComplex = {
            username: 'test username',
            password: 'Aa123456',
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
        }
        return supertest(app)
            .post('/api/user')
            .send(userPasswordNotComplex)
            .expect(400, {error: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'})
    })

    it(`responds with 400 when username is not unique`, () => {
        const duplicateUser = {
            username: testUser.username,
            password: 'Aa123456!',
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
        }
        return supertest(app)
            .post('/api/user')
            .send(duplicateUser)
            .expect(400, {error: 'Username is already taken'})
    })

    describe(`Given valid user data`, () => {
        it(`responds 201, serialized user with no password`, () => {
            const newUser = {
            username: 'test username',
            password: 'Aa123456!',
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
            }
            return supertest(app)
                .post('/api/user')
                .send(newUser)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.username).to.eql(newUser.username)
                    expect(res.body.firstname).to.eql(newUser.firstname)
                    expect(res.body.lastname).to.eql(newUser.lastname)
                    expect(res.body.email).to.eql(newUser.email)
                    expect(res.body).to.not.have.property('password')
                    expect(res.headers.location).to.eql(`/api/user/${res.body.id}`)
                })
        })

        it(`stores the new user in db with bcrypted password`, () => {
            const newUser = {
            username: 'test username',
            password: 'Aa123456!',
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
            }
            return supertest(app)
                .post('/api/user')
                .send(newUser)
                .expect(res => 
                    db
                    .from('users')
                    .select('*')
                    .where({id: res.body.id})
                    .first()
                    .then(row => {
                        expect(row.username).to.eql(newUser.username)
                        expect(row.firstname).to.eql(newUser.firstname)
                        expect(row.lastname).to.eql(newUser.lastname)
                        expect(row.email).to.eql(newUser.email)

                        return bcrypt.compare(newUser.password, row.password)
                    })
                    .then(compareMatch => {
                        expect(compareMatch).to.be.true
                    })
                )
        })
    })
  
})


})
