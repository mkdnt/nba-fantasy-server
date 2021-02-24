# Full Court

## Server

<p>Full Court is a React-based app that allows users to display their fantasy basketball teams and post about their
    progress, and read posts from fellow users.</p>

## [Full Court Live App](https://full-court.vercel.app/)

<p>After registering, you can add players and posts to your My Team dashboard. Display the players that are on your team
    in your fantasy basketball league. Write posts about how your players and team are doing. On the League Stories
    page, read up on other teams from various fantasy basketball leagues to gain insight about how to improve your team
    in your own league!</p>

<p>As of this version (1.0.0), the app is situated somewhere between a blog and a social network. Future versions of the
    app will incorporate commenting,
    liking, and other features to nudge it closer to social network territory. Depending on availability, other player
    stats, fantasy stats, or league formats may also be incorporated.</p>

<p>This is the server side of the application which uses Node and Express to build the API. For the database setup I am
    using PostgreSQL and Knex to make queries. I have incorporated full testing for all of the endpoints in a separate
    test
    folder.</p>

<p>This is a fullstack app using Heroku for server hosting and Vercel for client hosting.</p>

[Heroku](https://heroku.com)

[Vercel](https://vercel.com)

For API calls, the main endpoint is '/api'
<ul>
    <li>/users -- GET all users, POST a newly-registered user</li>
    <li>/posts -- GET all posts, POST a new post, PATCH a post, DELETE a post; all based on post_id</li>
    <li>/players -- GET all players, POST a new player, DELETE a player; all based on player_id</li>
    <li>/auth -- called for authorizing user login</li>
</ul>

<p>Please see the link below for the Full Court Client repository.</p>

### [Full Court Client](https://github.com/mkdnt/nba-fantasy-client)