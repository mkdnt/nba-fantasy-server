const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makePostsArray, makeMaliciousPost } = require("./posts.fixtures");

describe("Posts endpoints", () => {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
  });

  before("clean the table", () => db('posts').truncate());

  after("disconnect from db", () => db.destroy());

  afterEach("cleanup", () => db('posts').truncate());

  describe("GET /api/posts", () => {
    context(`Given no posts`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/api/posts").expect(200, []);
      });
    });

    context("Given there are posts in the database", () => {
      const testPosts = makePostsArray();

      beforeEach("insert posts", () => {
        return db.into('posts').insert(testPosts);
      });

      it("responds with 200 and all posts", () => {
        return supertest(app).get('/api/posts').expect(200, testPosts);
      });
    });

    context(`Given an XSS attack post`, () => {
      const maliciousPost = makeMaliciousPost();
      
      beforeEach('insert malicious post', () => {
        return db
          .into('posts')
          .insert([ maliciousPost ]);
      });
      
      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/posts`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(`Beware this malicious thing &lt;script&gt;alert("xss");&lt;/script&gt;`);
            expect(res.body[0].content).to.eql(`Pure evil vile image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`);
          });
      });
    });
  });

  describe("POST /api/posts", () => {
    it("creates post, responds with 201 and the new post", function() {
      this.retries(3);
      const newPost = {
        title: "Test New Post",
        content: "Test new post content test..."
      };
      return supertest(app)
        .post('/api/posts')
        .send(newPost)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).to.eql(newPost.title);
          expect(res.body.content).to.eql(newPost.content);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/posts/${res.body.id}`);
          const expected = new Date().toLocaleDateString();
          const actual = new Date(res.body.date_published).toLocaleDateString();
          expect(actual).to.eql(expected);
        })
        .then((postRes) =>
          supertest(app)
            .get(`/api/posts/${postRes.body.id}`)
            .expect(postRes.body)
        );
    });

    const fields = ['title', 'content'];
    fields.forEach(field => {
      const newPost = {
        title: "Test New Post",
        content: "Test new post content test..."
      };
      it(`responds with 400 and an error message when ${field} field is missing`, () => {
        delete newPost[field];
        return supertest(app)
          .post('/api/posts')
          .send(newPost)
          .expect(400, {
            error: {message: `Missing ${field} in request body`}
          });
      });
    });

    context(`When an XSS attack article is put in, article is sanitized right away`, () => {
      const {maliciousPost, expectedPost} = makeMaliciousPost();
      
      it('removes XSS attack content', () => {
        return supertest(app)
          .post(`/api/posts`)
          .send(maliciousPost)
          .expect(201)
          .expect(res => {
          expect(res.body.title).to.eql(expectedPost.title)
          expect(res.body.content).to.eql(expectedPost.content)
          });
      });
    });
  });

  describe("GET /api/posts/:post_id", () => {
    context(`Given no post with that ID`, () => {
      it(`responds with 404`, () => {
        const post_id = 123456;
        return supertest(app)
          .get(`/api/posts/${post_id}`)
          .expect(404, { error: { message: `Post doesn't exist` } });
      });
    });

    context("Given there are posts in the database", () => {
      const testPosts = makePostsArray();

      beforeEach("insert posts", () => {
        return db.into('posts').insert(testPosts);
      });

      it('GET /api/posts/:post_id responds with 200 and the specified post', () => {
        const post_id = 3;
        const expected = testPosts[post_id - 1];
        return supertest(app)
          .get(`/api/posts/${post_id}`)
          .expect(200, expected);
      });
    });

    context(`Given an XSS attack post`, () => {
      const maliciousPost = makeMaliciousPost();
      
      beforeEach('insert malicious post', () => {
        return db
          .into('posts')
          .insert([ maliciousPost ]);
      });
      
      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/posts/${maliciousPost.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(`Beware this malicious thing &lt;script&gt;alert("xss");&lt;/script&gt;`);
            expect(res.body[0].content).to.eql(`Pure evil vile image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`);
          });
      });
    });
  });

  describe(`DELETE /api/posts/:post_id`, () => {
    context(`Given no post with that ID`, () => {
      it(`responds with 404`, () => {
        const post_id = 123456;
        return supertest(app)
          .delete(`/api/posts/${post_id}`)
          .expect(404, { error: { message: `Post doesn't exist` } });
      });
    });

    context('Given there are posts in the database', () => {
      const testPosts = makePostsArray();
    
      beforeEach('insert posts', () => {
        return db
          .into('posts')
          .insert(testPosts);
      });
    
      it('responds with 204 and removes the post', () => {
        const idToRemove = 2;
        const expectedPosts = testPosts.filter(post => post.id !== idToRemove);
        return supertest(app)
          .delete(`/api/posts/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/posts`)
              .expect(expectedPosts)
          );
      });
    });
  });

  describe(`PATCH /api/posts/:post_id`, () => {
        context('Given no post with that ID', () => {
            it('responds with 404', () => {
                const post_id = 123456
                return supertest(app)
                    .patch(`/api/posts/${post_id}`)
                    .expect(404, {error: {message: `Post doesn't exist`}})
            })
        })

        context('Given there are posts in the database', () => {
            const testPosts = makePostsArray()

            beforeEach('insert posts', () => {
                return db
                    .into('posts')
                    .insert(testPosts)
            })

            it('responds with 204 and updates the post', () => {
                const idToUpdate = 2
                const updatePost = {
                    title: 'Updated Post',
                    content: 'Post content to update...',
                }
                const expectedPost = {
                    ...testPosts[idToUpdate -1],
                    ...updatePost
                }
                return supertest(app)
                    .patch(`/api/posts/${idToUpdate}`)
                    .send(updatePost)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/posts/${idToUpdate}`)
                            .expect(expectedPost)
                    )
            })

            it('responds with 400 when no required fields are supplied', () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/posts/${idToUpdate}`)
                    .send({irrelevantField: 'foo'})
                    .expect(400, { error: {message: `Request body must contain title and content`}})
            })

            it('responds with 204 when updating only a subset of the fields', () => {
                const idToUpdate = 2
                const updatePost = {
                    title: 'Updated Post',
                }
                const expectedPost = {
                    ...testPosts[idToUpdate -1],
                    ...updatePost
                }
                return supertest(app)
                    .patch(`/api/posts/${idToUpdate}`)
                    .send({
                        ...updatePost,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                        .get(`/api/posts/${idToUpdate}`)
                        .expect(expectedPost)    
                    )
            })
        })
    })
});
