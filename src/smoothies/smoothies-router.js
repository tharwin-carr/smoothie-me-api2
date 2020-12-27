const path = require('path');
const express = require('express');
const xss = require('xss');
const SmoothiesService = require('./smoothies-service');

const SmoothiesRouter = express.Router();
const jsonParser = express.json();

const serializeRecipe = smoothies => ({
    id: smoothies.id,
    title: xss(smoothies.title),
    fruit: xss(smoothies.fruit),
    vegetables: xss(smoothies.vegetables),
    nutsSeeds: xss(smoothies.nutsSeeds),
    liquids: xss(smoothies.liquids),
    powders: xss(smoothies.powders),
    sweetners: xss(smoothies.sweetners),
    other: xss(smoothies.other),
});

smoothiesRouter
.route('/')
.get((req, res, next) => {
    const knexInstance = req.app.get('db');
    SmoothiesService.getAllSmoothies(knexInstance)
    .then(smoothies => {
        res.json(smoothies.map(serializeRecipe))
    })
    .catch(next)
})
.post(jsonParser, (req, res, next) => {
    const { title, fruit, vegetables, nutsSeeds, liquids, powders, sweetners, other } = req.body;
    const newRecipe = { title, fruit, vegetables, nutsSeeds, liquids, powders, sweetners, other };

    for (const [key, value] of Object.entries(newRecipe)) {
        if (value == null) {
            return res.status(400).json({
                error: { message:  `Missing '${key}' in request body` }
            })
        }
    }
    
    //newRecipe.content = content
    SmoothiesService.insertRecipe(
        req.app.get('db'),
        newRecipe
    )
    .then(recipe => {
        res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${recipe.id}`))
            .json(serializeRecipe(recipe))
    })
    .catch(next)
})

smoothiesRouter
.route('/:id')
.all((req, res, next) => {
    SmoothiesService.getById(
        req.app.get('db'),
        req.params.id
    )
    .then(recipe => {
        if(!recipe) {
            return res.status(404).json({
                error: { message: `Recipe doesn't exist` }
            })
        }
        res.recipe = recipe
        next()
    })
    .catch(next)
})
.get((req, res, next) => {
    res.json(serializeRecipe(res.recipe))
})
.patch(jsonParser, (req, res, next) => {
    const { title, fruit, vegetables, nutsSeeds, liquids, powders, sweetners, other } = req.body
    const recipeToUpdate = { title, fruit, vegetables, nutsSeeds, liquids, powders, sweetners, other }

    const numberOfValues = Object.values(recipeToUpdate).filter(Boolean).length
    if(numberOfValues === 0) {
        return res.status(400).json({
            error: {
                message: `Request body must contain '${key}'`
            }
        })
    }
    SmoothiesService.updateRecipe(
        req.app.get('db'),
        req.params.id,
        recipeToUpdate
    )
    .then(numRowsAffected => {
        res.status(204).end()
    })
    .catch(next)
})
.delete((req, res, next) => {
    SmoothiesService.deleteRecipe(
        req.app.get('db'),
        req.params.id
    )
    .then((numRowsAffected) => {
        res.status(204).end()
    })
    .catch(next)
})

module.exports = smoothiesRouter;