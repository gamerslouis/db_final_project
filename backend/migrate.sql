-- This is an auto grenerate file
CREATE TABLE User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);


CREATE TABLE Friend (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    a INTEGER NOT NULL,
    b INTEGER NOT NULL
);
CREATE INDEX index_Friend_a_b on Friend (a, b);


CREATE TABLE Like (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user INTEGER NOT NULL,
    target INTEGER NOT NULL
);


CREATE TABLE ObservationPoint (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    meta_info INTEGER DEFAULT '',
    species INTEGER NOT NULL,
    file TEXT,
    user INTEGER DEFAULT 0
);
CREATE INDEX index_ObservationPoint_latitude on ObservationPoint (latitude);
CREATE INDEX index_ObservationPoint_longitude on ObservationPoint (longitude);
CREATE INDEX index_ObservationPoint_species on ObservationPoint (species);


CREATE TABLE Species (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scientific_name TEXT NOT NULL,
    common_name TEXT,
    taxonomy INTEGER NOT NULL,
    is_endemic INTEGER NOT NULL
);
CREATE INDEX index_Species_scientific_name on Species (scientific_name);
CREATE INDEX index_Species_taxonomy on Species (taxonomy);


CREATE TABLE SpeciesTaxonomy (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level INTEGER NOT NULL,
    name TEXT NOT NULL,
    chinese_name TEXT,
    parent INTEGER NOT NULL
);


