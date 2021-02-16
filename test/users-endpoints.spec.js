const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const helpers = require("./users.fixtures");
const bcrypt = require('bcryptjs');

describe.only('User Endpoints', function () {
  let db

  const testUsers = helpers.makeUsersArray()
  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = helpers.makeKnexInstance()
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  /**
   * @description Register a user and populate their fields
   **/

    describe("GET /api/users", () => {
        context(`Given no users`, () => {
        it(`responds with 200 and an empty list`, () => {
            return supertest(app).get('/api/users').expect(200, []);
        })
        });

        context("Given there are users in the database", () => {
        const testUsers = makeusersArray();

        beforeEach("insert users", () => {
            return db.into('users').insert(testUsers);
        });

        it("responds with 200 and all users", () => {
            return supertest(app).get('/api/users').expect(200, testUsers);
        });
        });
    });

  describe(`POST /api/users`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

    const requiredFields = ['username', 'password', 'firstname', 'lastname', 'email']
    
    requiredFields.forEach(field => {
        const registerAttemptBody = {
            username: 'test username',
            password: 'test password',
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
        }

        it(`responds with 400 error when ${field} is missing`, () => {
            delete registerAttemptBody[field]

            return supertest(app)
                .post('api/user')
                .send(registerAttemptBody)
                .expect(400, {error: `Missing '${field}' in request body`})
        })
    })

    it(`responds with 400 and 'Password must be 8 characters or longer' when empty password`, () => {
        const shortPassword = {
            username: 'test username',
            password: '1234567',
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
        }
        return supertest(app)
            .post('api/user')
            .send(shortPassword)
            .expect(400, {error: 'Password must be 8 characters or longer'})
    })

    it(`responds with 400 and 'Password must be 72 characters or less' when long password`, () => {
        const longPassword = {
            username: 'test username',
            password: '*'.repeat(73),
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
        }
        return supertest(app)
            .post('api/user')
            .send(longPassword)
            .expect(400, {error: 'Password must be 72 characters or less'})
    })

    it(`responds with 400 when password starts with spaces`, () => {
        const passwordStartsSpaces = {
            username: 'test username',
            password: ' 1Aa!2Bb@',
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
        }
        return supertest(app)
            .post('/api/users')
            .send(passwordStartsSpaces)
            .expect(400, {error: 'Password must not start or end with empty spaces'})
    })

    it(`responds with 400 when password ends with spaces`, () => {
        const passwordEndsSpaces = {
            username: 'test username',
            password: '1Aa!2Bb@ ',
            firstname: 'test firstname',
            lastname: 'test lastname',
            email: 'test email'
        }
        return supertest(app)
            .post('/api/users')
            .send(passwordEndsSpaces)
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
            .post('/api/users')
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
            .post('/api/users')
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
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.username).to.eql(newUser.username)
                    expect(res.body.firstname).to.eql(newUser.firstname)
                    expect(res.body.lastname).to.eql(newUser.lastname)
                    expect(res.body.email).to.eql(newUser.email)
                    expect(res.body).to.not.have.property('password')
                    expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
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
                .post('/api/users')
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
