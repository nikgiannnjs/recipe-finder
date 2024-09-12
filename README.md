## Introduction

A simple backend Recipe finder-generator application built with Node.js, Express, and PostgreSQL.

## Features

-User Authentication:
Users can create an account, log in, and log out securely using JWT (JSON Web Tokens) for authentication.

-CRUD Operations for Recipes:
Create: Users can add new recipes by providing the required fields.
Read: Users can view a list of all recipes or generate a specific recipe by giving specific ingredients.
Update: Users can edit (only) their recipes to modify ingredients, instructions, or other details.
Delete: Users can remove (only) their recipes they no longer want to keep.

-Search and Filtering:
Users can search and filter recipes based on recipe names.

-User Profiles:
Each user has a profile where they can add, update and delete their recipes or add recipes in favourites while they can manage their account settings too.

## Technologies Used

- **Node.js**
- **Express**
- **PostgreSQL**
- **Pg**
- **JWT**
- **Bcrypt**

## Installation

git clone https://github.com/nikgiannnjs/recipe-finder.git
cd recipe-generator
npm install
set up PostgreSQL database--> Run the queries found in the SQL file, in your PostgreSQL database, in this order: 1) createTables 2)recipeInserts 3)categoriesInsert (\*adminInsert can be ran after the creation of a user for giving administration rights to a user.)
update the dbconnection with your PostgreSQL credentials.
npm start to run the app (using nodemon)

## Usage

A user creates his profile giving a first name, last name, email and a password. He can search for recipes based on recipe name or can give (3-5) specific ingredients to find matching recipes with these.
The user can save recipes in his favourite list (favourites table in database) and unsave them as well. Can add recipes for all the users to see, update and delete them. The users can update and delete the recipes only they have added, except if the user is an admin.

## API Endpoints

POST /recipefinder/auth/registration
Creates a new user. Requires a JSON body:
{
"firstName": "firstName",
"lastName": "lastName",
"email": "test@gmail.com",
"password": "userPassword",
"passwordConfirm":"userPassword"
}

POST /recipefinder/auth/login
User login. Requires a JSON body:
{
"email": "test@gmail.com",
"user_password": "userPassword"
}

POST /recipefinder/auth/changepassword
Changes the user's password. Requires a JSON body:
{
"email":"test@gmail.com",
"oldPassword":"oldPassword",
"newPassword":"newPassword",
"newPasswordConfirm":"newPassword"
}

POST /recipefinder/auth//forgotpassword
Sends email with link for change password. Requires a JSON body:
{
"email":"test@gmail.com",
}

POST /recipefinder/auth/logout
User logout. Does not need a body, it only deletes the token.

GET /recipefinder/recipes/allrecipes
Shows the user all the available recipes.

POST /recipefinder/recipes/addnewrecipe/id
The user can add a new recipe. Requires a JSON body and the user id as URL parameter
{
"category": "Dessert",
"recipe_name": "Chocolate Lava Cake",
"first_ingredient": "Dark chocolate",
"second_ingredient": "Butter",
"third_ingredient": "Sugar",
"fourth_ingredient": "Eggs",
"fifth_ingredient": "Flour",
"cooking_time": "15",
"description": "Indulge in this rich and decadent chocolate lava cake, featuring a gooey molten center that flows out when you cut into it. Made with dark chocolate and butter, this dessert is quick to prepare and perfect for impressing guests or treating yourself."
}

GET /recipefinder/recipes/findrecipe?q=firstIngredient&q=secondIngredient&q=thirdIngredient
Generates a recipe based on the ingredients. The user must give at least three ingredients as a query string.

POST /recipefinder/recipes/updaterecipe/id?user_id=test
Updates a recipe. Requires the recipe id as a parameter and the user id as query string.

GET /recipefinder/recipes/myrecipes/id
Gets all the recipes of the id given as a parameter.

DELETE /recipefinder/recipes/deleterecipe/id?user_id=test
Deletes a recipe only if the user ais an admin. Requires the recipe id as a parameter and the user id as a query string.

GET /recipefinder/recipes/search?q=test
Finds a recipe based on the recipe name. Works as a searchbar. Requires the users input as a query string

GET /recipefinder/recipes/myrecipes/id
Gets all the recipes added by the a user. Requires a user id as a parameter.

GET /recipefinder/users/getallusers/id
Gets all users, only if the user is an admin. Requires a user id as a parameter.

DELETE /recipefinder/users/deleteuser/id?user_id=test
Deletes a user, only if the user is an admin. Requires a user (be deleted) id as a parameter and the user (the admin) id as a query string.

POST /recipefinder/users/addtofavourites/id?user_id=test
Adds a recipe to the user's favourites. Requires the recipe id to be added, as a parameter and the user id as a query string.

GET /recipefinder/users/favourites/id
Gets all the user's favourites. Requires the user id as a parameter.

DELETE /users/deletefavourites/id?user_id=test
Deletes a recipe from the user's favourites. Requires the recipe id as a parameter and the users if as a query string.

## Database Schema

erDiagram
recipes {
int recipe_id PK
varchar category
varchar recipe_name
varchar first_ingredient
varchar second_ingredient
varchar third_ingredient
varchar fourth_ingredient
varchar fifth_ingredient
int cooking_time
varchar description
timestamp created_at
timestamp updated_at
}

    categories {
        int category_id PK
        varchar category UK
    }

    users {
        int user_id PK
        varchar first_name
        varchar last_name
        varchar email UK
        boolean admin_state
        varchar user_password UK
    }

    favourites {
        varchar user_id
        int recipe_id
    }

    recipes ||--o{ categories : "has"
    users ||--o{ favourites : "has"
    recipes ||--o{ favourites : "has"
