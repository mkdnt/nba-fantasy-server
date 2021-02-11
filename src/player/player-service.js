const PlayerService = {
    getAllPlayers(knex) {
        return knex.select('*').from('players')
    },
    getUserPlayers(knex, id) {
        return knex.from('userPlayer').select('*').where()
    },
    insertPlayer(knex, newPlayer) {
        return knex
            .insert(newPlayer)
            .into('players')
            .returning('*')
            .then (rows => {
                return rows[0]
            })
    },

};

module.exports = PlayerService