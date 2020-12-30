CREATE TABLE smoothieme_favorites (
    favorite_id INTEGER REFERENCES smoothieme_smoothies(id) ON DELETE CASCADE NOT NULL
)