CREATE TABLE smoothies (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title TEXT NOT NULL,
    fruit TEXT,
    vegetables TEXT,
    nutsSeeds TEXT,
    liquids TEXT,
    powders TEXT,
    sweetners TEXT,
    other TEXT
);