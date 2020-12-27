CREATE TABLE favorites (
    favorite_id INTEGER REFERENCES recipes(id) ON DELETE CASACADE NOT NULL
);