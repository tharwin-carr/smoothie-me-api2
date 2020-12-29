const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeSmoothiesArray } = require('./smoothies.fixtures');
const supertest = require('supertest');

describe('smoothies endpoints', function() {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db('smoothieme_smoothies').truncate());

    afterEach('cleanup', () => db('smoothieme_smoothies').truncate());

    describe(`Get /api/smoothies`, () => {
        context(`Given no smoothies`, () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                .get('/api/smoothies')
                .expect(200, [])
            })
        })

        context('Given there are smoothies in the database', () => {
            const testSmoothies = makeSmoothiesArray();
            beforeEach('insert smoothies', () => {
                return db
                .into('smoothieme_smoothies')
                .insert(testSmoothies)
            });
            it('GET /api/smoothies responds with 200 and all of the smoothies', () => {
                return supertest(app)
                .get('/api/smoothies')
                .expect(200, testSmoothies)
            })        
        });
    });

    describe(`GET /api/smoothies/:smoothies_id`, () => {
        context(`Given no smoothies`, () => {
            it(`responds with 404`, () => {
                const smoothiesId = 123456;
                return supertest(app)
                .get(`/api/smoothies/${smoothiesId}`)
                .expect(404, { error: { message: `Smoothie doesn't exist` } })
            })
        })
        context('Given there are smoothies in the database', () => {
            const testSmoothies = makeSmoothiesArray();

            beforeEach('insert smoothies', () => {
                return db
                    .into('smoothieme_smoothies')
                    .insert(testSmoothies)
            });

            it('responds with 200 and the specified article', () => {
                const smoothiesId = 2;
                const expectedSmoothie = testSmoothies[smoothiesId - 1]
                return supertest(app)
                .get(`/api/smoothies/${smoothiesId}`)
                .expect(200, expectedSmoothie)
            });
        });
        context(`Given an XSS attack smoothie`, () => {
            const maliciousSmoothie = {
                id: 911,
                title: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
            }

            beforeEach('insert malicious smoothie', () => {
                return db
                    .into('smoothieme_smoothies')
                    .insert([ maliciousSmoothie ])
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                .get(`/api/smoothies/${maliciousSmoothie.id}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.title).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                });
            });
        });
    });
    describe(`POST /api/smoothies`, () => {
        it(`creates a smoothie, responding with 201 and the new date`, function() {
            this.retries(3)
            const newSmoothie = {
                'title': 'Test',
                "fruit": "1 cup berry mix",
                "vegetables": "none",
                "nutsseeds": "peanut butter",
                "liquids": "1 cup milk",
                "powders": "whey protein",
                "sweetners": "honey",
                "other": "oats"
            }
            return supertest(app)
                .post('/api/smoothies')
                .send(newSmoothie)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newSmoothie.title)
                    expect(res.body).to.have.property('id')
                })
                .then(postRes =>
                    supertest(app)
                    .get(`/api/smoothies/${postRes.body.id}`)
                    .expect(postRes.body)
                )
        })
        const requiredFields = ['title']

        requiredFields.forEach(field => {
            const newSmoothie = {
                'title':'test test'
            }
            
            it(`responds with 400 and an error meessage when the '${field}' is missing`, () => {
                delete newSmoothie[field]

                return supertest(app)
                    .post('/api/smoothies')
                    .send(newSmoothie)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    });
            });
        });
    });

    describe(`PATCH /api/smoothies/:smoothies_id`, () => {
        context(`Given no smoothies`, () => {
          it(`responds with 404`, () => {
            const smoothieId = 123456
            return supertest(app)
              .delete(`/api/smoothies/${smoothieId}`)
              .expect(404, { error: { message: `Smoothie doesn't exist` } })
          })
        })
        context('Given there are smoothies in the database', () => {
            const testSmoothies = makeSmoothiesArray();

            beforeEach('insert smoothies', () => {
                return db
                    .into('smoothieme_smoothies')
                    .insert(testSmoothies)
            });

            it('responds with 204 and updates the Smoothies', () => {
                const idToUpdate = 2
                const updateSmoothie = {
                    title: 'updated title',
                }
                const expectedSmoothie = {
                    ...testSmoothies[idToUpdate - 1],
                    ...updateSmoothie
                }

                return supertest(app)
                    .patch(`/api/smoothies/${idToUpdate}`)
                    .send({
                        ...updateSmoothie,
                        fieldToIgnore: 'should not be in GET response'})
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/smoothies/${idToUpdate}`)
                            .expect(expectedSmoothie)
                    );
            });
        });
    });
    describe(`DELETE /api/smoothies/:smoothies_id`, () => {
        context('Given there are smoothies in the database', () => {
            const testSmoothies = makeSmoothiesArray()

            beforeEach('insert smoothies', () => {
                return db
                    .into('smoothieme_smoothies')
                    .insert(testSmoothies)
            })

            it('responds with 204 and removes the smoothie', () => {
                const idToRemove = 2
                const expectedSmoothies = testSmoothies.filter(smoothie => smoothie.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/smoothies/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                        .get(`/api/smoothies`)
                        .expect(expectedSmoothies)
                    );
            });
        });
    });
});