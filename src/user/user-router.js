const express = require('express')
const path = require('path')
const UserService = require('./user-service')

const userRouter = express.Router()
const jsonBodyParser = express.json()

userRouter
  .route('/:user_id')
    .all((req, res, next) => {
        UserService.getUserById(req.app.get('db'), req.params.user_id)
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ 
                        error: {message: `User doesn't exist`}
                    });
                };
                res.user = user;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.json({
            id: res.user.id,
            username: res.user.username,
            teamname: res.user.teamname,
        });
    })

userRouter
  .route('/:user_id/posts')
    .all((req, res, next) => {
        UserService.getUserPosts(req.app.get('db'), req.params.user_id)
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
            user_id: res.post.user_id
        });
    })    

userRouter
    .get('/', (req, res, next) => {
            UserService.getAllUsers(req.app.get('db'))
                .then(users => {
                    res.json(users)
                })
                .catch(next)
        })
    .post('/', jsonBodyParser, async (req, res, next) => {
        const {username, password, teamname, firstname, lastname, email} = req.body

        for (const field of ['username', 'password', 'teamname', 'firstname', 'lastname', 'email'])
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

            const newUser = {username, password: hashedPassword, teamname, firstname, lastname, email,}

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