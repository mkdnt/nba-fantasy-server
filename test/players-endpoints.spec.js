const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makePlayersArray } = require("./players.fixtures");

describe("Players endpoints", () => {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
  });

  before("clean the table", () => db('players').truncate());

  after("disconnect from db", () => db.destroy());

  afterEach("cleanup", () => db('players').truncate());

  describe("GET /api/players", () => {
    context(`Given no players`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get('/api/players').expect(200, []);
      })
    });

    context("Given there are players in the database", () => {
      const testPlayers = makePlayersArray();

      beforeEach("insert players", () => {
        return db.into('players').insert(testPlayers);
      });

      it("responds with 200 and all players", () => {
        return supertest(app).get('/api/players').expect(200, testPlayers);
      });
    });
  });

  describe("POST /api/players", () => {
    it("creates player, responds with 201 and the new player", function() {
      this.retries(3);
      const newPlayer = {
        first_name: 'Test First Name 1',
        last_name: 'Test Last Name 1',
        team: 'Test Team 1',
        position: 'Test Position 1',
        user_id: 1
      };
      return supertest(app)
        .post('/api/players')
        .send(newPlayer)
        .expect(201)
        .expect((res) => {
          expect(res.body.first_name).to.eql(newPlayer.first_name);
          expect(res.body.last_name).to.eql(newPlayer.last_name);
          expect(res.body.team).to.eql(newPlayer.team);
          expect(res.body.position).to.eql(newPlayer.position);
          expect(res.body.user_id).to.eql(newPlayer.user_id);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/players/${res.body.id}`);
          expect(actual).to.eql(expected);
        })
        .then((playerRes) =>
          supertest(app)
            .get(`/api/players/${playerRes.body.id}`)
            .expect(playerRes.body)
        );
    });

    const fields = ['first_name', 'last_name', 'team', 'position', 'user_id'];
    fields.forEach(field => {
      const newPlayer = {
        first_name: 'Test First Name 1',
        last_name: 'Test Last Name 1',
        team: 'Test Team 1',
        position: 'Test Position 1',
        user_id: 1
      };
      it(`responds with 400 and an error message when ${field} field is missing`, () => {
        delete newPlayer[field];
        return supertest(app)
          .post('/api/players')
          .send(newPlayer)
          .expect(400, {
            error: {message: `Missing ${field} in request body`}
          });
      });
    });

  });

  describe(`DELETE /api/players/:player_id`, () => {
    context(`Given no player with that ID`, () => {
      it(`responds with 404`, () => {
        const player_id = 123456123456;
        return supertest(app)
          .delete(`/api/players/${player_id}`)
          .expect(404, { error: { message: `Player doesn't exist` } });
      });
    });

    context('Given there are players in the database', () => {
      const testPlayers = makePlayersArray();
    
      beforeEach('insert players', () => {
        return db
          .into('players')
          .insert(testPlayers);
      });
    
      it('responds with 204 and removes the player', () => {
        const idToRemove = 2;
        const expectedPlayers = testPlayers.filter(player => player.id !== idToRemove);
        return supertest(app)
          .delete(`/api/players/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/players`)
              .expect(expectedPlayers)
          );
      });
    });
  });

    describe("GET /api/players/:user_id", () => {

      context("Given there are players in the database by the specified user_id", () => {
      const testPlayers = makePlayersArray();

      beforeEach("insert players", () => {
        return db.into('players').insert(testPlayers);
      });

      it('GET /api/players/:user_id responds with 200 and the specified player', () => {
        const user_id = 1
        const expectedPlayers = testPlayers.filter(player => player.user_id === user_id);
        return supertest(app)
          .get(`/api/players/${user_id}`)
          .expect(200, expectedPlayers);
      });
    });

    });
});
