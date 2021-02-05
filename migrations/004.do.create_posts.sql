CREATE TABLE posts (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title TEXT NOT NULL,
    content TEXT,
    date_published TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL
);