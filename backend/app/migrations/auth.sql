-- This is auto geneated by flask-orm

create table user(
    id int not null auto_increment,
    username varchar(50) not null,
    password varchar(150) not null,
    PRIMARY KEY (id),
    UNIQUE KEY(username)
);

create table 
