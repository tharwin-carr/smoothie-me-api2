const FavoritesService = {
    getFavorites(knex) {
        return knex
        .select('*')
        .from('smoothieme_favorites')
        .join('smoothieme_smoothies', 'smoothieme_smoothies.id', '=', 'smoothieme_favorites.favorite_id')
    },
    insertFavorite(knex, favoriteId, ) {
        return knex
            .insert({ favorite_id: favoriteId })
            .into('smoothieme_favorites')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getFavoriteById(knex, favoriteId) {
        return knex
            .from('smoothieme_favorites')
            .select('*')
            .where('favorite_id', favoriteId)
            .first()
    },
    deleteFavorite(knex, favoriteId) {
        return knex('smoothieme_favorites')
        .where('favorite_id', favoriteId)
        .delete()
    },
    updateFavorite(knex, id, newFavoriteFields) {
        return knex('smoothieme_favorites')
        .where({id })
        .update(newFavoriteFields)
    },
};

module.exports = FavoritesService;