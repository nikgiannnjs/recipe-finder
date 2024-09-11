INSERT INTO categories (category)
SELECT DISTINCT category
FROM recipes
WHERE category IS NOT NULL;