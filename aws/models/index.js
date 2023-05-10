// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const FavoriteType = {
  "MEAL": "MEAL",
  "FOOD": "FOOD",
  "EXERCISE": "EXERCISE",
  "WORKOUT": "WORKOUT"
};

const Tier = {
  "FREE": "FREE",
  "FREEMIUM": "FREEMIUM",
  "PREMIUM": "PREMIUM"
};

const Goal = {
  "DEFICIT": "DEFICIT",
  "MAINTENANCE": "MAINTENANCE",
  "SURPLUS": "SURPLUS"
};

const { Payouts, WorkoutDetailModifier, PantryItem, Application, Follower, Favorite, ExerciseEquiptmentDetail, WorkoutPlayDetail, WorkoutPlay, WorkoutDetails, Workout, Exercise, Equiptment, RunProgress, Ingredient, Meal, MealProgress, FoodProgress, User, Progress, Activity, Media, Coordinates } = initSchema(schema);

export {
  Payouts,
  WorkoutDetailModifier,
  PantryItem,
  Application,
  Follower,
  Favorite,
  ExerciseEquiptmentDetail,
  WorkoutPlayDetail,
  WorkoutPlay,
  WorkoutDetails,
  Workout,
  Exercise,
  Equiptment,
  RunProgress,
  Ingredient,
  Meal,
  MealProgress,
  FoodProgress,
  User,
  Progress,
  FavoriteType,
  Tier,
  Goal,
  Activity,
  Media,
  Coordinates
};