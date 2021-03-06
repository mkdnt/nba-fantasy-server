const PostService = {
    getAllPosts(knex) {
        return knex.select('*').from('posts')
    },

    insertPost(knex, newPost) {
        return knex
            .insert(newPost)
            .into('posts')
            .returning('*')
            .then (rows => {
                return rows[0]
            })
    },
    getUserPosts(knex, id) {
        return knex.from('posts').select('*').where('user_id', id)
    },
    getPostById(knex, id) {
        return knex.from('posts').select('*').where('id', id).first()
    },

    deletePost(knex, id) {
        return knex('posts').where({id}).delete()
    },

    updatePost(knex, id, newPostFields) {
        return knex('posts').where({id}).update(newPostFields)
    }
};

module.exports = PostService