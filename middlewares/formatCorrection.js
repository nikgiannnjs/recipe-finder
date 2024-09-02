exports.correctFormats = async (
  category,
  recipe_name,
  first_ingredient,
  second_ingredient,
  third_ingredient,
  fourth_ingredient,
  fifth_ingredient
) => {
  const correctCategory = category.charAt(0).toUpperCase() + category.slice(1);
  const correctRecipeName =
    recipe_name.charAt(0).toUpperCase() + recipe_name.slice(1);
  const correctFirstIngredient = first_ingredient
    ? first_ingredient.charAt(0).toUpperCase() + first_ingredient.slice(1)
    : null;
  const correctSecondIngredient = second_ingredient
    ? second_ingredient.charAt(0).toUpperCase() + second_ingredient.slice(1)
    : null;
  const correctThirdIngredient = third_ingredient
    ? third_ingredient.charAt(0).toUpperCase() + third_ingredient.slice(1)
    : null;
  const correctFourthIngredient = fourth_ingredient
    ? fourth_ingredient.charAt(0).toUpperCase() + fourth_ingredient.slice(1)
    : null;
  const correctFifthIngredient = fifth_ingredient
    ? fifth_ingredient.charAt(0).toUpperCase() + fifth_ingredient.slice(1)
    : null;

  return {
    correctCategory,
    correctRecipeName,
    correctFirstIngredient,
    correctSecondIngredient,
    correctThirdIngredient,
    correctFourthIngredient,
    correctFifthIngredient,
  };
};
