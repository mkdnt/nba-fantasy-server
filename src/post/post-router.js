const path = require('path');
const express = require('express');
const PostService = require('./post-service');
const xss = require('xss');

const postRouter = express.Router();
const jsonParser = express.json();

postRouter
    .route('/')
    .get((req, res, next) => {
        PostService.getAllPosts(req.app.get('db'))
    })

module.exports = postRouter;