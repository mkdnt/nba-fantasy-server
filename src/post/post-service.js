const PostService = {
    getAllPosts(knex) {
        return knex.select('*').from('posts')
    },
};

module.exports = PostService