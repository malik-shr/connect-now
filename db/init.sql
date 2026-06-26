CREATE TABLE users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL
);

CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    customer TEXT NOT NULL REFERENCES users(id),
    installer TEXT NOT NULL REFERENCES users(id)
);