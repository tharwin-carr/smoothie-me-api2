const path = require('path')
const express = require('express')
const xss = require('xss')
const FavoritesService = require('./favorites-service')

const favoritesRouter = express.Router()
const jsonParser = express.json()

const serializeFavorite = favorite => ({
    favorite_id: favorite.id,
    favorite_title: xss(favorite.title),
    favorite_fruit: xss(favorite.fruit),
    favorite_vegetables: xss(favorite.vegetables),
    favorite_nutsseeds: xss(favorite.nutsseeds),
    favorite_liquids: xss(favorite.liquids),
    favorite_powders: xss(favorite.powders),
    favorite_sweetners: xss(favorite.sweetners),
    favorite_other: xss(favorite.other),
})

favoritesRouter
.route('/')
.get((req, res, next) => {
    const knexInstance = req.app.get('db')
    FavoritesService.getFavorites(knexInstance)
    .then(favorites => {
        res.json(favorites.map(serializeFavorite))
    })
    .catch(next)
})
.post(jsonParser, (req, res, next) => {
    const favoriteId = req.body.favorite_id
    
    FavoritesService.insertFavorite(
        req.app.get('db'),
        favoriteId,
    )

    .then(results => {
        res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${results.id}`))
            .json(serializeFavorite(results))
    })
    .catch(next)
})

favoritesRouter
.route('/:id')
.all((req, res, next) => {
    FavoritesService.getFavoriteById(
        req.app.get('db'),
        req.params.id
    )
    .then(favorite => {
        if(!favorite) {
            return res.status(404).json({
                error: { message: `Favorite doesn't exist`}
            })
        }
        res.favorite = favorite
        next()
    })
    .catch(next)
})
.get((req, res, next) => {
    res.json(serializeFavorite(res.favorite))
})
.patch(jsonParser, (req, res, next) => {
    const { title, fruit, vegetables, nutsseeds, liquids, powders, sweetners, other } = req.body
    const favoriteToUpdate = { title, fruit, vegetables, nutsseeds, liquids, powders, sweetners, other }

    const numberOfValues = Object.values(favoriteToUpdate).filter(Boolean).length
    if(numberOfValues === 0) {
        return res.status(400).json({
            error: {
                message: `Request body must contain '${key}'`
            }
        })
    }
    FavoritesService.updateFavorite(
        req.app.get('db'),
        req.params.id,
        favoriteToUpdate
    )
    .then(numRowsAffected => {
        res.status(204).end()
    })
    .catch(next)
})
.delete((req, res, next) => {
    favoriteId = req.params.id
    FavoritesService.deleteFavorite(
        req.app.get('db'),
        favoriteId
    )
    .then((numRowsAffected) => {
        res.status(204).end()
    })
    .catch(next)
})

module.exports = favoritesRouter