

import moment, { Moment } from "moment"
import type { Tables } from "../../supabase/dao"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { fetchProgressChildren, fetchToday } from "../api/progress"

export type TFoodProgress = Tables['food_progress']['Row'] & { food: Tables['food']['Row'] }
export type TMealProgress = Tables['meal_progress']['Row'] & {
  meal: Tables['meal']['Row'] & {
    meal_ingredients: Tables['meal_ingredients']['Row'][]
  }
}
export type TWorkoutPlay = Tables['workout_play']['Row'] & { workout: (Tables['workout']['Row'] & { user: Tables['user']['Row'] | null }) | null }

const initialState = {
  today: null as Tables['progress']['Row'] | null,
  formattedDate: moment().format() as string,
  foodProgress: [] as TFoodProgress[],
  mealProgress: [] as TMealProgress[],
  workoutProgress: [] as TWorkoutPlay[],
  runProgress: [] as Tables['run_progress']['Row'][]
}

export type TProgress = typeof initialState;

export const aggregateFoodAndMeals = (foodProgress: TFoodProgress[] | undefined, mealProgress: TMealProgress[] | undefined) => {
  let food_progress = foodProgress || []
  let meal_progress = mealProgress || []
  let _ingredients = meal_progress.map((x) => ({
    ...x.meal,
    consumedWeight: x.consumed_weight,
    totalWeight: x.total_weight,
  }));
  let __ingredients = _ingredients.map((x) => {
    return {
      ...x,
      meal_ingredients: x.meal_ingredients.map((z) => ({
        ...z,
        consumed_weight: x.consumedWeight,
        total_weight: x.totalWeight,
      })),
    };
  });
  let ingredients = __ingredients.flatMap((x) => x.meal_ingredients);
  const caloriesFromFoodAndMeals =
    food_progress.reduce((prev, c) => prev + (c.calories || 0), 0) +
    ingredients.reduce(
      (prev, curr) =>
        prev +
        (curr.calories || 0) *
        ((curr.consumed_weight || 1) / (curr.total_weight || 1)),
      0
    );
  const proteinFromFoodAndMeals =
    food_progress.reduce((prev, c) => prev + (c.protein || 0), 0) +
    ingredients.reduce(
      (prev, curr) =>
        prev +
        (curr.protein || 0) *
        ((curr.consumed_weight || 1) / (curr.total_weight || 1)),
      0
    );
  const carbsFromFoodAndMeals =
    food_progress.reduce((prev, c) => prev + (c.carbs || 0), 0) +
    ingredients.reduce(
      (prev, curr) =>
        prev +
        (curr.carbs || 0) *
        ((curr.consumed_weight || 1) / (curr.total_weight || 1)),
      0
    );
  let fatFromFoodAndMeals = food_progress.reduce((prev, c) => prev + (c.fat || 0), 0) +
    ingredients.reduce(
      (prev, curr) =>
        prev +
        (curr.fat || 0) *
        ((curr.consumed_weight || 1) / (curr.total_weight || 1)),
      0
    );

  return {
    protein: proteinFromFoodAndMeals,
    carbs: carbsFromFoodAndMeals,
    calories: caloriesFromFoodAndMeals,
    fat: fatFromFoodAndMeals
  }

}

//@ts-ignore
let progressSlice = createSlice({
  initialState,
  name: 'progress',
  reducers: {
    changeDate: (state: TProgress, action: PayloadAction<{ date: string }>) => {
      state.formattedDate = moment(action.payload.date).format()
    },
    setProgressValue: <T extends keyof TProgress['today'], V extends TProgress['today'][T]>(state: TProgress, action: PayloadAction<{ key: T, value: V }>) => {
      let { key, value } = action.payload
      console.log('Updating ', key, ' to ', value)
      //@ts-ignore
      state['today'][key] = value;
    }
  },
  extraReducers: _builder => {
    _builder.addCase(fetchToday.fulfilled, (state, action) => {
      let today = action.payload
      state.today = today;
    })
      .addCase(fetchProgressChildren.fulfilled, (state, action) => {
        let { food, meals, workouts, runs } = action.payload
        state.foodProgress = food;
        state.mealProgress = meals;
        state.workoutProgress = workouts;
        state.runProgress = runs
      })
  }
})


export default progressSlice;
export const { changeDate, setProgressValue } = progressSlice.actions