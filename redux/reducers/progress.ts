

import moment, { Moment } from "moment"
import type { Tables } from "../../supabase/dao"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { deleteTaskProgress, fetchProgressChildren, fetchToday, fetchTodaysTasks, saveTaskProgress } from "../api/progress"

export type TFoodProgress = Tables['food_progress']['Row'] & { food: Tables['food']['Row'] }
export type TMealProgress = Tables['meal_progress']['Row'] & {
  meal: Tables['meal']['Row'] & {
    meal_ingredients: Tables['meal_ingredients']['Row'][]
  }
}
export type TWorkoutPlay = Tables['workout_play']['Row'] & { workout: (Tables['workout']['Row'] & { user: Tables['user']['Row'] | null }) | null }
export type TAgendaTask = Tables['agenda_task']['Row'] & {meal?: Tables['meal']['Row'] | null | undefined, workout?: Tables['workout']['Row'] | null | undefined, fitness_plan?: Tables['fitness_plan']['Row'] | null | undefined, progress: Tables['task_progress']['Row'] | null }
export type TFitnessPlanSubscription = Tables['fitness_plan_subscription']['Row'] & {fitness_plan?: Tables['fitness_plan']['Row'] | null | undefined}

const initialState = {
  today: null as Tables['progress']['Row'] | null,
  formattedDate: moment().format() as string,
  foodProgress: [] as TFoodProgress[],
  mealProgress: [] as TMealProgress[],
  workoutProgress: [] as TWorkoutPlay[],
  runProgress: [] as Tables['run_progress']['Row'][],
  plans: [] as TFitnessPlanSubscription[],
  tasks: [] as TAgendaTask[]
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
  let [calories, protein, carbs, fat, otherNutrition] = [0,0,0,0,{}]
  for (var food of food_progress) {
    calories += food.calories || 0;
    protein += food.protein || 0;
    carbs += food.carbs || 0;
    fat += food.fat || 0;
    for (var k of Object.keys(food.otherNutrition || {})) {
      //@ts-ignore
      otherNutrition[k] = (otherNutrition[k] || 0) + (Number(food.otherNutrition[k]) || 0)
    }

  }
  for (var ingr of ingredients) {
    let fx = ((ingr.consumed_weight || 1) / (ingr.total_weight || 1))
    calories += (ingr.calories || 0) * fx;
    protein += (ingr.protein || 0) * fx;
    carbs += (ingr.carbs || 0) * fx;
    fat += (ingr.fat || 0) * fx;
    for (var k of Object.keys(ingr.otherNutrition || {})) {
      //@ts-ignore
      otherNutrition[k] = (otherNutrition[k] || 0) + ((Number(ingr.otherNutrition[k]) || 0) * fx)
    }

  }

  return {
    protein, carbs, fat, calories, otherNutrition
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
      .addCase(fetchTodaysTasks.fulfilled, (state, action) => {
        let {plans, tasks} = action.payload
        state.plans = plans || [];
        state.tasks = tasks || []
      })
      .addCase(saveTaskProgress.fulfilled, (state, action) => {
        let {task_progress} = action.payload
        state.tasks = [...state.tasks.map(x => {
          if (x.id === task_progress.task_id) {
            return {...x, progress: task_progress}
          }
          return x
        })]
      })
      .addCase(deleteTaskProgress.fulfilled, (state, action) => {
        let {task_id} = action.payload
        state.tasks = [...state.tasks.map(x => {
          if (x.id === task_id) {
            return {...x, progress: null}
          }
          return x
        })]
      })
  }
})


export default progressSlice;
export const { changeDate, setProgressValue } = progressSlice.actions