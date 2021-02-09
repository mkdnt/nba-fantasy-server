const express = require('express')
const path = require('path')
const UserService = require('./user-service')

const userRouter = express.Router()
const jsonBodyParser = express.json()

userRouter
    .post('/', jsonBodyParser, async (req, res, next) => {
        const {username, password, firstname, lastname, email} = req.body

        for (const field of ['username', 'password', 'firstname', 'lastname', 'email'])
            if (!req.body[field])
                return res.status(400).json({error: `Missing '${field}' in request body`})
        
        try {
            const passwordError = UserService.validatePassword(password)

            if (passwordError)
                return res.status(400).json({error: passwordError})

            const hasUserWithUsername = await UserService.hasUserWithUsername(req.app.get('db'), username)

            if (hasUserWithUsername)
                return res.status(400).json({error: 'Username is already taken'})

            const hashedPassword = await UserService.hashPassword(password)

            const newUser = {username, password: hashedPassword, firstname, lastname, email,}

            const user = await UserService.insertUser(req.app.get('db'), newUser)

            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                .json(UserService.serializeUser(user))
        }
        catch(error) {
            next(error)
        }
    })

    module.exports = userRouter