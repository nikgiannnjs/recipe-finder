exports.nullIngs = async (Obj) => {
  return Obj.rows.map(
    ({
      recipe_id,
      category,
      recipe_name,
      first_ingredient,
      second_ingredient,
      third_ingredient,
      fourth_ingredient,
      fifth_ingredient,
      cooking_time,
      description,
    }) => {
      return {
        recipe_id,
        category,
        recipe_name,
        first_ingredient,
        second_ingredient,
        third_ingredient,
        fourth_ingredient:
          fourth_ingredient !== null ? fourth_ingredient : undefined,
        fifth_ingredient:
          fifth_ingredient !== null ? fifth_ingredient : undefined,
        cooking_time,
        description,
      };
    }
  );
};
