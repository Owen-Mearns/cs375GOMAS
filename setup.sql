DROP DATABASE IF EXISTS auth;
CREATE DATABASE auth;
\c auth
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 1000,
    password VARCHAR(255) NOT NULL
);
