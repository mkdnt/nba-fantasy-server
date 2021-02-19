const path = require('path');
const express = require('express');
const PostService = require('./post-service');
const xss = require('xss');
const app = require('../app');

const postRouter = express.Router();
const jsonParser = express.json();

postRouter
    .route('/')
    .get((req, res, next) => {
        PostService.getAllPosts(req.app.get('db'))
            .then(posts => {
                res.json(posts)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { title, content, user_id, author } = req.body
        const newPost = { title, content, user_id, author }

        for (const [key, value] of Object.entries(newPost)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body`}
                })
            }
        }

        PostService.insertPost(
            req.app.get('db'),
            newPost
        )
            .then(post => {
                res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${post.id}`))
                .json(post)
            })
            .catch(next)
    })

postRouter
  .route('/byuser/:user_id')
    .all((req, res, next) => {
        PostService.getUserPosts(req.app.get('db'), req.params.user_id)
            .then(posts => {
                res.json(posts)
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.post.id,
            title: xss(res.post.title),
            content: xss(res.post.content),
            date_published: res.post.date_published,
            user_id: res.post.user_id,
            author: res.post.author
        });
    })

postRouter
    .route('/:post_id')
    .all((req, res, next) => {
        PostService.getPostById(req.app.get('db'), req.params.post_id)
            .then((post) => {
                if (!post) {
                    return res.status(404).json({ 
                        error: {message: `Post doesn't exist`}
                    });
                };
                res.post = post;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.json({
            id: res.post.id,
            title: xss(res.post.title),
            content: xss(res.post.content),
            date_published: res.post.date_published,
            user_id: res.post.user_id,
            author: res.post.author,
        });
    })
    .delete((req, res, next) => {
        PostService.deletePost(req.app.get('db'), req.params.post_id)
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    })
    .patch(jsonParser, (req, res, next) => {
        const { title, content, user_id, author } = req.body
        const postToUpdate = { title, content, user_id, author }

        const numberOfValues = Object.values(postToUpdate).filter(Boolean).length
            if (numberOfValues === 0) {
                return res.status(400).json({
                    error: { message: `Request body must contain either 'title' or 'content'` }
                })
            }
        
        PostService.updatePost(req.app.get('db'), req.params.post_id, postToUpdate)
            .then((numRowsAffected) => {
                res.status(204).end();
            })
            .catch(next);
    });

module.exports = postRouter;