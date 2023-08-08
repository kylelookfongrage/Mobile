// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const ReportReasons = {
  "VIOLENCE": "VIOLENCE",
  "NUDITY": "NUDITY",
  "SPAM": "SPAM",
  "HATE_SPEECH": "HATE_SPEECH",
  "OTHER": "OTHER"
};

const FavoriteType = {
  "MEAL": "MEAL",
  "FOOD": "FOOD",
  "EXERCISE": "EXERCISE",
  "WORKOUT": "WORKOUT",
  "POST": "POST",
  "COMMENT": "COMMENT"
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

const { Review, FitnessPlanSubscription, FitnessPlanDetail, FitnessPlan, BadgeEarned, BadgeProgress, Badge, ChatMessages, ChatRoom, Post, TaxReports, ReportsOfTerms, Comments, Payouts, WorkoutDetailModifier, PantryItem, Application, Follower, Favorite, ExerciseEquiptmentDetail, WorkoutPlayDetail, WorkoutPlay, WorkoutDetails, Workout, Exercise, Equiptment, RunProgress, Ingredient, Meal, MealProgress, FoodProgress, User, Progress, Activity, Media, Coordinates } = initSchema(schema);

export {
  Review,
  FitnessPlanSubscription,
  FitnessPlanDetail,
  FitnessPlan,
  BadgeEarned,
  BadgeProgress,
  Badge,
  ChatMessages,
  ChatRoom,
  Post,
  TaxReports,
  ReportsOfTerms,
  Comments,
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
  ReportReasons,
  FavoriteType,
  Tier,
  Goal,
  Activity,
  Media,
  Coordinates
};