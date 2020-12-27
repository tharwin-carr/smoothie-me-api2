const SmoothiesService = {
    getAllSmoothies(knex) {
        return knex.select('*').from('smoothies')
    },
    insertSmoothie(knex, newSmoothie) {
        return knex
            .insert(newSmoothie)
            .into('smoothies')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex
            .from('smoothies')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteSmoothie(knex, id) {
        return knex('smoothies')
        .where({ id })
        .delete()
    },
    updateSmoothie(knex, id, newSmoothieFields) {
        return knex('smoothies')
        .where({ id })
        .update(newSmoothieFields)
    }
};

module.exports = SmoothiesService;