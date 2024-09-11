CREATE TABLE recipes (
 recipe_id SERIAL PRIMARY KEY,
 category VARCHAR(250),
 recipe_name VARCHAR(250) NOT NULL,
 first_ingredient VARCHAR(250) NOT NULL,
 second_ingredient VARCHAR(250) NOT NULL,
 third_ingredient VARCHAR(250) NOT NULL,
 fourth_ingredient VARCHAR(250),
 fifth_ingredient VARCHAR(250),
 cooking_time INT NOT NULL,
 description VARCHAR(2000) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
category_id SERIAL PRIMARY KEY,
category VARCHAR(250) UNIQUE
);

CREATE TABLE users (
user_id SERIAL PRIMARY KEY,
first_name VARCHAR(50) NOT NULL,
last_name VARCHAR(50) NOT NULL,
email VARCHAR(200) NOT NULL UNIQUE,
admin_state BOOLEAN NOT NULL DEFAULT FALSE,
user_password VARCHAR(250) NOT NULL UNIQUE 
);

CREATE TABLE favourites (
user_id VARCHAR(250),
recipe_id INT NOT NULL
);



