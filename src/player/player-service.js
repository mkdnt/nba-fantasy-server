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
    deletePlayer(knex, id) {
        return knex('players').where({id}).delete()
    },
};

module.exports = PlayerService