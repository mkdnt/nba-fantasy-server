const path = require('path');
const express = require('express');
const PlayerService = require('./player-service');
const xss = require('xss');
const app = require('../app');

const playerRouter = express.Router();
const jsonParser = express.json();

playerRouter
    .route('/')
    .get((req, res, next) => {
        PlayerService.getAllPlayers(req.app.get('db'))
            .then(players => {
                res.json(players)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { nba_id, user_id } = req.body
        const newPlayer = { nba_id, user_id }

        for (const [key, value] of Object.entries(newPlayer)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body`}
                })
            }
        }

        PlayerService.insertPlayer(
            req.app.get('db'),
            newPlayer
        )
            .then(player => {
                res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${player.id}`))
                .json(player)
            })
            .catch(next)
    })

module.exports = playerRouter;