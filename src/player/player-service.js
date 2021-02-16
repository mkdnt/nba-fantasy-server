const PlayerService = {
    getAllPlayers(knex) {
        return knex.select('*').from('players')
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
    getUserPlayers(knex, id) {
        return knex.from('players').select('*').where('user_id', id)
    },
    deletePlayer(knex, id) {
        return knex('players').where({id}).delete()
    },
};

module.exports = PlayerService