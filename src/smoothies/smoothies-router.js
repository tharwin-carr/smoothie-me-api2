const path = require('path');
const express = require('express');
const xss = require('xss');
const SmoothiesService = require('./smoothies-service');

const smoothiesRouter = express.Router();
const jsonParser = express.json();

const serializeSmoothie = smoothies => ({
    id: smoothies.id,
    title: xss(smoothies.title),
    fruit: xss(smoothies.fruit),
    vegetables: xss(smoothies.vegetables),
    nutsseeds: xss(smoothies.nutsseeds),
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
        res.json(smoothies.map(serializeSmoothie))
    })
    .catch(next)
})
.post(jsonParser, (req, res, next) => {
    const { title, fruit, vegetables, nutsseeds, liquids, powders, sweetners, other } = req.body;
    const newSmoothie = { title, fruit, vegetables, nutsseeds, liquids, powders, sweetners, other };

    for (const [key, value] of Object.entries(newSmoothie)) {
        if (value == null) {
            return res.status(400).json({
                error: { message:  `Missing '${key}' in request body` }
            })
        }
    }
    
    //newSmoothie.content = content
    SmoothiesService.insertSmoothie(
        req.app.get('db'),
        newSmoothie
    )
    .then(smoothie => {
        res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${smoothie.id}`))
            .json(serializeSmoothie(smoothie))
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
    .then(smoothie => {
        if(!smoothie) {
            return res.status(404).json({
                error: { message: `Smoothie doesn't exist` }
            })
        }
        res.smoothie = smoothie
        next()
    })
    .catch(next)
})
.get((req, res, next) => {
    res.json(serializeSmoothie(res.smoothie))
})
.patch(jsonParser, (req, res, next) => {
    const { title, fruit, vegetables, nutsseeds, liquids, powders, sweetners, other } = req.body
    const smoothieToUpdate = { title, fruit, vegetables, nutsseeds, liquids, powders, sweetners, other }

    const numberOfValues = Object.values(smoothieToUpdate).filter(Boolean).length
    if(numberOfValues === 0) {
        return res.status(400).json({
            error: {
                message: `Request body must contain '${key}'`
            }
        })
    }
    SmoothiesService.updateSmoothie(
        req.app.get('db'),
        req.params.id,
        smoothieToUpdate
    )
    .then(numRowsAffected => {
        res.status(204).end()
    })
    .catch(next)
})
.delete((req, res, next) => {
    SmoothiesService.deleteSmoothie(
        req.app.get('db'),
        req.params.id
    )
    .then((numRowsAffected) => {
        res.status(204).end()
    })
    .catch(next)
})

module.exports = smoothiesRouter;