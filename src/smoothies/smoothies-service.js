const SmoothiesService = {
    getAllSmoothies(knex) {
        return knex.select('*').from('smoothieme_smoothies')
    },
    insertSmoothie(knex, newSmoothie) {
        return knex
            .insert(newSmoothie)
            .into('smoothieme_smoothies')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex
            .from('smoothieme_smoothies')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteSmoothie(knex, id) {
        return knex('smoothieme_smoothies')
        .where({ id })
        .delete()
    },
    updateSmoothie(knex, id, newSmoothieFields) {
        return knex('smoothieme_smoothies')
        .where({ id })
        .update(newSmoothieFields)
    }
};

module.exports = SmoothiesService;