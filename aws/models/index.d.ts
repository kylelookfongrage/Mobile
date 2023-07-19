import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection } from "@aws-amplify/datastore";

export enum ReportReasons {
  VIOLENCE = "VIOLENCE",
  NUDITY = "NUDITY",
  SPAM = "SPAM",
  HATE_SPEECH = "HATE_SPEECH",
  OTHER = "OTHER"
}

export enum FavoriteType {
  MEAL = "MEAL",
  FOOD = "FOOD",
  EXERCISE = "EXERCISE",
  WORKOUT = "WORKOUT",
  POST = "POST",
  COMMENT = "COMMENT"
}

export enum Tier {
  FREE = "FREE",
  FREEMIUM = "FREEMIUM",
  PREMIUM = "PREMIUM"
}

export enum Goal {
  DEFICIT = "DEFICIT",
  MAINTENANCE = "MAINTENANCE",
  SURPLUS = "SURPLUS"
}

type EagerActivity = {
  readonly name?: string | null;
  readonly img?: string | null;
  readonly totalTime?: number | null;
}

type LazyActivity = {
  readonly name?: string | null;
  readonly img?: string | null;
  readonly totalTime?: number | null;
}

export declare type Activity = LazyLoading extends LazyLoadingDisabled ? EagerActivity : LazyActivity

export declare const Activity: (new (init: ModelInit<Activity>) => Activity)

type EagerMedia = {
  readonly uri?: string | null;
  readonly type?: string | null;
  readonly awsID?: string | null;
}

type LazyMedia = {
  readonly uri?: string | null;
  readonly type?: string | null;
  readonly awsID?: string | null;
}

export declare type Media = LazyLoading extends LazyLoadingDisabled ? EagerMedia : LazyMedia

export declare const Media: (new (init: ModelInit<Media>) => Media)

type EagerCoordinates = {
  readonly lat: number;
  readonly long: number;
}

type LazyCoordinates = {
  readonly lat: number;
  readonly long: number;
}

export declare type Coordinates = LazyLoading extends LazyLoadingDisabled ? EagerCoordinates : LazyCoordinates

export declare const Coordinates: (new (init: ModelInit<Coordinates>) => Coordinates)

type ChatMessagesMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ChatRoomMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type PostMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type TaxReportsMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ReportsOfTermsMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type CommentsMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type PayoutsMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type WorkoutDetailModifierMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type PantryItemMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ApplicationMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type FollowerMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type FavoriteMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ExerciseEquiptmentDetailMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type WorkoutPlayDetailMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type WorkoutPlayMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type WorkoutDetailsMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type WorkoutMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ExerciseMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type EquiptmentMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type RunProgressMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type IngredientMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type MealMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type MealProgressMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type FoodProgressMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ProgressMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type EagerChatMessages = {
  readonly id: string;
  readonly chatroomID: string;
  readonly from: string;
  readonly description: string;
  readonly media?: (Media | null)[] | null;
  readonly postID?: string | null;
  readonly likes?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChatMessages = {
  readonly id: string;
  readonly chatroomID: string;
  readonly from: string;
  readonly description: string;
  readonly media?: (Media | null)[] | null;
  readonly postID?: string | null;
  readonly likes?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ChatMessages = LazyLoading extends LazyLoadingDisabled ? EagerChatMessages : LazyChatMessages

export declare const ChatMessages: (new (init: ModelInit<ChatMessages, ChatMessagesMetaData>) => ChatMessages) & {
  copyOf(source: ChatMessages, mutator: (draft: MutableModel<ChatMessages, ChatMessagesMetaData>) => MutableModel<ChatMessages, ChatMessagesMetaData> | void): ChatMessages;
}

type EagerChatRoom = {
  readonly id: string;
  readonly users: string[];
  readonly ChatMessages?: (ChatMessages | null)[] | null;
  readonly accepted?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChatRoom = {
  readonly id: string;
  readonly users: string[];
  readonly ChatMessages: AsyncCollection<ChatMessages>;
  readonly accepted?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ChatRoom = LazyLoading extends LazyLoadingDisabled ? EagerChatRoom : LazyChatRoom

export declare const ChatRoom: (new (init: ModelInit<ChatRoom, ChatRoomMetaData>) => ChatRoom) & {
  copyOf(source: ChatRoom, mutator: (draft: MutableModel<ChatRoom, ChatRoomMetaData>) => MutableModel<ChatRoom, ChatRoomMetaData> | void): ChatRoom;
}

type EagerPost = {
  readonly id: string;
  readonly Comments?: (Comments | null)[] | null;
  readonly description?: string | null;
  readonly media?: (Media | null)[] | null;
  readonly userID: string;
  readonly workoutID?: string | null;
  readonly mealID?: string | null;
  readonly exerciseID?: string | null;
  readonly runProgressID?: string | null;
  readonly ChatMessages?: (ChatMessages | null)[] | null;
  readonly draft?: boolean | null;
  readonly public?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPost = {
  readonly id: string;
  readonly Comments: AsyncCollection<Comments>;
  readonly description?: string | null;
  readonly media?: (Media | null)[] | null;
  readonly userID: string;
  readonly workoutID?: string | null;
  readonly mealID?: string | null;
  readonly exerciseID?: string | null;
  readonly runProgressID?: string | null;
  readonly ChatMessages: AsyncCollection<ChatMessages>;
  readonly draft?: boolean | null;
  readonly public?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Post = LazyLoading extends LazyLoadingDisabled ? EagerPost : LazyPost

export declare const Post: (new (init: ModelInit<Post, PostMetaData>) => Post) & {
  copyOf(source: Post, mutator: (draft: MutableModel<Post, PostMetaData>) => MutableModel<Post, PostMetaData> | void): Post;
}

type EagerTaxReports = {
  readonly id: string;
  readonly paidStripeFee?: boolean | null;
  readonly year?: number | null;
  readonly Payouts?: (Payouts | null)[] | null;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyTaxReports = {
  readonly id: string;
  readonly paidStripeFee?: boolean | null;
  readonly year?: number | null;
  readonly Payouts: AsyncCollection<Payouts>;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type TaxReports = LazyLoading extends LazyLoadingDisabled ? EagerTaxReports : LazyTaxReports

export declare const TaxReports: (new (init: ModelInit<TaxReports, TaxReportsMetaData>) => TaxReports) & {
  copyOf(source: TaxReports, mutator: (draft: MutableModel<TaxReports, TaxReportsMetaData>) => MutableModel<TaxReports, TaxReportsMetaData> | void): TaxReports;
}

type EagerReportsOfTerms = {
  readonly id: string;
  readonly potentialID?: string | null;
  readonly reasonDescription?: string | null;
  readonly reportType?: ReportReasons | keyof typeof ReportReasons | null;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyReportsOfTerms = {
  readonly id: string;
  readonly potentialID?: string | null;
  readonly reasonDescription?: string | null;
  readonly reportType?: ReportReasons | keyof typeof ReportReasons | null;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ReportsOfTerms = LazyLoading extends LazyLoadingDisabled ? EagerReportsOfTerms : LazyReportsOfTerms

export declare const ReportsOfTerms: (new (init: ModelInit<ReportsOfTerms, ReportsOfTermsMetaData>) => ReportsOfTerms) & {
  copyOf(source: ReportsOfTerms, mutator: (draft: MutableModel<ReportsOfTerms, ReportsOfTermsMetaData>) => MutableModel<ReportsOfTerms, ReportsOfTermsMetaData> | void): ReportsOfTerms;
}

type EagerComments = {
  readonly id: string;
  readonly string?: string | null;
  readonly userID: string;
  readonly potentialID?: string | null;
  readonly type?: FavoriteType | keyof typeof FavoriteType | null;
  readonly postID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyComments = {
  readonly id: string;
  readonly string?: string | null;
  readonly userID: string;
  readonly potentialID?: string | null;
  readonly type?: FavoriteType | keyof typeof FavoriteType | null;
  readonly postID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Comments = LazyLoading extends LazyLoadingDisabled ? EagerComments : LazyComments

export declare const Comments: (new (init: ModelInit<Comments, CommentsMetaData>) => Comments) & {
  copyOf(source: Comments, mutator: (draft: MutableModel<Comments, CommentsMetaData>) => MutableModel<Comments, CommentsMetaData> | void): Comments;
}

type EagerPayouts = {
  readonly id: string;
  readonly userID: string;
  readonly stripeId?: string | null;
  readonly amount?: number | null;
  readonly paidDate?: string | null;
  readonly workoutActivity?: number | null;
  readonly activityStart?: string | null;
  readonly activityEnd?: string | null;
  readonly mealActivity?: number | null;
  readonly taxreportsID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPayouts = {
  readonly id: string;
  readonly userID: string;
  readonly stripeId?: string | null;
  readonly amount?: number | null;
  readonly paidDate?: string | null;
  readonly workoutActivity?: number | null;
  readonly activityStart?: string | null;
  readonly activityEnd?: string | null;
  readonly mealActivity?: number | null;
  readonly taxreportsID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Payouts = LazyLoading extends LazyLoadingDisabled ? EagerPayouts : LazyPayouts

export declare const Payouts: (new (init: ModelInit<Payouts, PayoutsMetaData>) => Payouts) & {
  copyOf(source: Payouts, mutator: (draft: MutableModel<Payouts, PayoutsMetaData>) => MutableModel<Payouts, PayoutsMetaData> | void): Payouts;
}

type EagerWorkoutDetailModifier = {
  readonly id: string;
  readonly userID: string;
  readonly rounds?: number | null;
  readonly exercisesPerRound?: number | null;
  readonly restAfterRound?: number | null;
  readonly timePerExercise?: number | null;
  readonly setsPerExercise?: number | null;
  readonly name?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyWorkoutDetailModifier = {
  readonly id: string;
  readonly userID: string;
  readonly rounds?: number | null;
  readonly exercisesPerRound?: number | null;
  readonly restAfterRound?: number | null;
  readonly timePerExercise?: number | null;
  readonly setsPerExercise?: number | null;
  readonly name?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type WorkoutDetailModifier = LazyLoading extends LazyLoadingDisabled ? EagerWorkoutDetailModifier : LazyWorkoutDetailModifier

export declare const WorkoutDetailModifier: (new (init: ModelInit<WorkoutDetailModifier, WorkoutDetailModifierMetaData>) => WorkoutDetailModifier) & {
  copyOf(source: WorkoutDetailModifier, mutator: (draft: MutableModel<WorkoutDetailModifier, WorkoutDetailModifierMetaData>) => MutableModel<WorkoutDetailModifier, WorkoutDetailModifierMetaData> | void): WorkoutDetailModifier;
}

type EagerPantryItem = {
  readonly id: string;
  readonly purchased?: boolean | null;
  readonly ingredientID: string;
  readonly userID: string;
  readonly inCart?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPantryItem = {
  readonly id: string;
  readonly purchased?: boolean | null;
  readonly ingredientID: string;
  readonly userID: string;
  readonly inCart?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type PantryItem = LazyLoading extends LazyLoadingDisabled ? EagerPantryItem : LazyPantryItem

export declare const PantryItem: (new (init: ModelInit<PantryItem, PantryItemMetaData>) => PantryItem) & {
  copyOf(source: PantryItem, mutator: (draft: MutableModel<PantryItem, PantryItemMetaData>) => MutableModel<PantryItem, PantryItemMetaData> | void): PantryItem;
}

type EagerApplication = {
  readonly id: string;
  readonly isDeleted: boolean;
  readonly approved: boolean;
  readonly stripeID?: string | null;
  readonly userID: string;
  readonly workoutID: string;
  readonly mealID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyApplication = {
  readonly id: string;
  readonly isDeleted: boolean;
  readonly approved: boolean;
  readonly stripeID?: string | null;
  readonly userID: string;
  readonly workoutID: string;
  readonly mealID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Application = LazyLoading extends LazyLoadingDisabled ? EagerApplication : LazyApplication

export declare const Application: (new (init: ModelInit<Application, ApplicationMetaData>) => Application) & {
  copyOf(source: Application, mutator: (draft: MutableModel<Application, ApplicationMetaData>) => MutableModel<Application, ApplicationMetaData> | void): Application;
}

type EagerFollower = {
  readonly id: string;
  readonly subscribedFrom: string;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyFollower = {
  readonly id: string;
  readonly subscribedFrom: string;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Follower = LazyLoading extends LazyLoadingDisabled ? EagerFollower : LazyFollower

export declare const Follower: (new (init: ModelInit<Follower, FollowerMetaData>) => Follower) & {
  copyOf(source: Follower, mutator: (draft: MutableModel<Follower, FollowerMetaData>) => MutableModel<Follower, FollowerMetaData> | void): Follower;
}

type EagerFavorite = {
  readonly id: string;
  readonly potentialID: string;
  readonly userID: string;
  readonly type?: FavoriteType | keyof typeof FavoriteType | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyFavorite = {
  readonly id: string;
  readonly potentialID: string;
  readonly userID: string;
  readonly type?: FavoriteType | keyof typeof FavoriteType | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Favorite = LazyLoading extends LazyLoadingDisabled ? EagerFavorite : LazyFavorite

export declare const Favorite: (new (init: ModelInit<Favorite, FavoriteMetaData>) => Favorite) & {
  copyOf(source: Favorite, mutator: (draft: MutableModel<Favorite, FavoriteMetaData>) => MutableModel<Favorite, FavoriteMetaData> | void): Favorite;
}

type EagerExerciseEquiptmentDetail = {
  readonly id: string;
  readonly exerciseID: string;
  readonly equiptmentID: string;
  readonly sub?: string | null;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyExerciseEquiptmentDetail = {
  readonly id: string;
  readonly exerciseID: string;
  readonly equiptmentID: string;
  readonly sub?: string | null;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ExerciseEquiptmentDetail = LazyLoading extends LazyLoadingDisabled ? EagerExerciseEquiptmentDetail : LazyExerciseEquiptmentDetail

export declare const ExerciseEquiptmentDetail: (new (init: ModelInit<ExerciseEquiptmentDetail, ExerciseEquiptmentDetailMetaData>) => ExerciseEquiptmentDetail) & {
  copyOf(source: ExerciseEquiptmentDetail, mutator: (draft: MutableModel<ExerciseEquiptmentDetail, ExerciseEquiptmentDetailMetaData>) => MutableModel<ExerciseEquiptmentDetail, ExerciseEquiptmentDetailMetaData> | void): ExerciseEquiptmentDetail;
}

type EagerWorkoutPlayDetail = {
  readonly id: string;
  readonly reps?: number | null;
  readonly rest?: number | null;
  readonly weight?: number | null;
  readonly secs?: number | null;
  readonly completed?: boolean | null;
  readonly workoutplayID: string;
  readonly workoutID: string;
  readonly exerciseID: string;
  readonly userID?: string | null;
  readonly workoutdetailsID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyWorkoutPlayDetail = {
  readonly id: string;
  readonly reps?: number | null;
  readonly rest?: number | null;
  readonly weight?: number | null;
  readonly secs?: number | null;
  readonly completed?: boolean | null;
  readonly workoutplayID: string;
  readonly workoutID: string;
  readonly exerciseID: string;
  readonly userID?: string | null;
  readonly workoutdetailsID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type WorkoutPlayDetail = LazyLoading extends LazyLoadingDisabled ? EagerWorkoutPlayDetail : LazyWorkoutPlayDetail

export declare const WorkoutPlayDetail: (new (init: ModelInit<WorkoutPlayDetail, WorkoutPlayDetailMetaData>) => WorkoutPlayDetail) & {
  copyOf(source: WorkoutPlayDetail, mutator: (draft: MutableModel<WorkoutPlayDetail, WorkoutPlayDetailMetaData>) => MutableModel<WorkoutPlayDetail, WorkoutPlayDetailMetaData> | void): WorkoutPlayDetail;
}

type EagerWorkoutPlay = {
  readonly id: string;
  readonly sub?: string | null;
  readonly totalTime?: number | null;
  readonly WorkoutPlayDetails?: (WorkoutPlayDetail | null)[] | null;
  readonly userID: string;
  readonly date?: string | null;
  readonly workoutID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyWorkoutPlay = {
  readonly id: string;
  readonly sub?: string | null;
  readonly totalTime?: number | null;
  readonly WorkoutPlayDetails: AsyncCollection<WorkoutPlayDetail>;
  readonly userID: string;
  readonly date?: string | null;
  readonly workoutID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type WorkoutPlay = LazyLoading extends LazyLoadingDisabled ? EagerWorkoutPlay : LazyWorkoutPlay

export declare const WorkoutPlay: (new (init: ModelInit<WorkoutPlay, WorkoutPlayMetaData>) => WorkoutPlay) & {
  copyOf(source: WorkoutPlay, mutator: (draft: MutableModel<WorkoutPlay, WorkoutPlayMetaData>) => MutableModel<WorkoutPlay, WorkoutPlayMetaData> | void): WorkoutPlay;
}

type EagerWorkoutDetails = {
  readonly id: string;
  readonly sets?: number | null;
  readonly reps?: number | null;
  readonly secs?: number | null;
  readonly rest?: number | null;
  readonly workoutID: string;
  readonly exerciseID: string;
  readonly userID?: string | null;
  readonly note?: string | null;
  readonly WorkoutPlayDetails?: (WorkoutPlayDetail | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyWorkoutDetails = {
  readonly id: string;
  readonly sets?: number | null;
  readonly reps?: number | null;
  readonly secs?: number | null;
  readonly rest?: number | null;
  readonly workoutID: string;
  readonly exerciseID: string;
  readonly userID?: string | null;
  readonly note?: string | null;
  readonly WorkoutPlayDetails: AsyncCollection<WorkoutPlayDetail>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type WorkoutDetails = LazyLoading extends LazyLoadingDisabled ? EagerWorkoutDetails : LazyWorkoutDetails

export declare const WorkoutDetails: (new (init: ModelInit<WorkoutDetails, WorkoutDetailsMetaData>) => WorkoutDetails) & {
  copyOf(source: WorkoutDetails, mutator: (draft: MutableModel<WorkoutDetails, WorkoutDetailsMetaData>) => MutableModel<WorkoutDetails, WorkoutDetailsMetaData> | void): WorkoutDetails;
}

type EagerWorkout = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly img?: string | null;
  readonly sub?: string | null;
  readonly premium?: boolean | null;
  readonly WorkoutDetails?: (WorkoutDetails | null)[] | null;
  readonly WorkoutPlayDetails?: (WorkoutPlayDetail | null)[] | null;
  readonly category?: string | null;
  readonly userID: string;
  readonly Applications?: (Application | null)[] | null;
  readonly WorkoutPlays?: (WorkoutPlay | null)[] | null;
  readonly public?: boolean | null;
  readonly initialWorkout?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyWorkout = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly img?: string | null;
  readonly sub?: string | null;
  readonly premium?: boolean | null;
  readonly WorkoutDetails: AsyncCollection<WorkoutDetails>;
  readonly WorkoutPlayDetails: AsyncCollection<WorkoutPlayDetail>;
  readonly category?: string | null;
  readonly userID: string;
  readonly Applications: AsyncCollection<Application>;
  readonly WorkoutPlays: AsyncCollection<WorkoutPlay>;
  readonly public?: boolean | null;
  readonly initialWorkout?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Workout = LazyLoading extends LazyLoadingDisabled ? EagerWorkout : LazyWorkout

export declare const Workout: (new (init: ModelInit<Workout, WorkoutMetaData>) => Workout) & {
  copyOf(source: Workout, mutator: (draft: MutableModel<Workout, WorkoutMetaData>) => MutableModel<Workout, WorkoutMetaData> | void): Workout;
}

type EagerExercise = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly userID: string;
  readonly media?: (Media | null)[] | null;
  readonly sub?: string | null;
  readonly WorkoutPlayDetails?: (WorkoutPlayDetail | null)[] | null;
  readonly WorkoutDetails?: (WorkoutDetails | null)[] | null;
  readonly ExerciseEquiptmentDetails?: (ExerciseEquiptmentDetail | null)[] | null;
  readonly bodyParts?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyExercise = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly userID: string;
  readonly media?: (Media | null)[] | null;
  readonly sub?: string | null;
  readonly WorkoutPlayDetails: AsyncCollection<WorkoutPlayDetail>;
  readonly WorkoutDetails: AsyncCollection<WorkoutDetails>;
  readonly ExerciseEquiptmentDetails: AsyncCollection<ExerciseEquiptmentDetail>;
  readonly bodyParts?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Exercise = LazyLoading extends LazyLoadingDisabled ? EagerExercise : LazyExercise

export declare const Exercise: (new (init: ModelInit<Exercise, ExerciseMetaData>) => Exercise) & {
  copyOf(source: Exercise, mutator: (draft: MutableModel<Exercise, ExerciseMetaData>) => MutableModel<Exercise, ExerciseMetaData> | void): Exercise;
}

type EagerEquiptment = {
  readonly id: string;
  readonly name: string;
  readonly img: string;
  readonly userID?: string | null;
  readonly sub?: string | null;
  readonly ExerciseEquiptmentDetails?: (ExerciseEquiptmentDetail | null)[] | null;
  readonly public?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyEquiptment = {
  readonly id: string;
  readonly name: string;
  readonly img: string;
  readonly userID?: string | null;
  readonly sub?: string | null;
  readonly ExerciseEquiptmentDetails: AsyncCollection<ExerciseEquiptmentDetail>;
  readonly public?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Equiptment = LazyLoading extends LazyLoadingDisabled ? EagerEquiptment : LazyEquiptment

export declare const Equiptment: (new (init: ModelInit<Equiptment, EquiptmentMetaData>) => Equiptment) & {
  copyOf(source: Equiptment, mutator: (draft: MutableModel<Equiptment, EquiptmentMetaData>) => MutableModel<Equiptment, EquiptmentMetaData> | void): Equiptment;
}

type EagerRunProgress = {
  readonly id: string;
  readonly date?: string | null;
  readonly coordinates?: (Coordinates | null)[] | null;
  readonly progressID: string;
  readonly sub?: string | null;
  readonly userID: string;
  readonly totalTime?: number | null;
  readonly runType?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyRunProgress = {
  readonly id: string;
  readonly date?: string | null;
  readonly coordinates?: (Coordinates | null)[] | null;
  readonly progressID: string;
  readonly sub?: string | null;
  readonly userID: string;
  readonly totalTime?: number | null;
  readonly runType?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type RunProgress = LazyLoading extends LazyLoadingDisabled ? EagerRunProgress : LazyRunProgress

export declare const RunProgress: (new (init: ModelInit<RunProgress, RunProgressMetaData>) => RunProgress) & {
  copyOf(source: RunProgress, mutator: (draft: MutableModel<RunProgress, RunProgressMetaData>) => MutableModel<RunProgress, RunProgressMetaData> | void): RunProgress;
}

type EagerIngredient = {
  readonly id: string;
  readonly name: string;
  readonly units: string;
  readonly quantity: number;
  readonly protein: number;
  readonly carbs: number;
  readonly fat: number;
  readonly otherNutrition?: string | null;
  readonly measures: string[];
  readonly healthLabels?: (string | null)[] | null;
  readonly totalWeight: number;
  readonly img?: string | null;
  readonly category?: string | null;
  readonly foodContentsLabel?: string | null;
  readonly kcal?: number | null;
  readonly mealID?: string | null;
  readonly edamamId?: string | null;
  readonly userID?: string | null;
  readonly PantryItems?: (PantryItem | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyIngredient = {
  readonly id: string;
  readonly name: string;
  readonly units: string;
  readonly quantity: number;
  readonly protein: number;
  readonly carbs: number;
  readonly fat: number;
  readonly otherNutrition?: string | null;
  readonly measures: string[];
  readonly healthLabels?: (string | null)[] | null;
  readonly totalWeight: number;
  readonly img?: string | null;
  readonly category?: string | null;
  readonly foodContentsLabel?: string | null;
  readonly kcal?: number | null;
  readonly mealID?: string | null;
  readonly edamamId?: string | null;
  readonly userID?: string | null;
  readonly PantryItems: AsyncCollection<PantryItem>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Ingredient = LazyLoading extends LazyLoadingDisabled ? EagerIngredient : LazyIngredient

export declare const Ingredient: (new (init: ModelInit<Ingredient, IngredientMetaData>) => Ingredient) & {
  copyOf(source: Ingredient, mutator: (draft: MutableModel<Ingredient, IngredientMetaData>) => MutableModel<Ingredient, IngredientMetaData> | void): Ingredient;
}

type EagerMeal = {
  readonly id: string;
  readonly description?: string | null;
  readonly steps?: (string | null)[] | null;
  readonly premium?: boolean | null;
  readonly category?: string | null;
  readonly userID: string;
  readonly MealProgresses?: (MealProgress | null)[] | null;
  readonly sub?: string | null;
  readonly Ingredients?: (Ingredient | null)[] | null;
  readonly name: string;
  readonly media?: (Media | null)[] | null;
  readonly Applications?: (Application | null)[] | null;
  readonly isAiGenerated?: boolean | null;
  readonly public?: boolean | null;
  readonly originalMeal?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMeal = {
  readonly id: string;
  readonly description?: string | null;
  readonly steps?: (string | null)[] | null;
  readonly premium?: boolean | null;
  readonly category?: string | null;
  readonly userID: string;
  readonly MealProgresses: AsyncCollection<MealProgress>;
  readonly sub?: string | null;
  readonly Ingredients: AsyncCollection<Ingredient>;
  readonly name: string;
  readonly media?: (Media | null)[] | null;
  readonly Applications: AsyncCollection<Application>;
  readonly isAiGenerated?: boolean | null;
  readonly public?: boolean | null;
  readonly originalMeal?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Meal = LazyLoading extends LazyLoadingDisabled ? EagerMeal : LazyMeal

export declare const Meal: (new (init: ModelInit<Meal, MealMetaData>) => Meal) & {
  copyOf(source: Meal, mutator: (draft: MutableModel<Meal, MealMetaData>) => MutableModel<Meal, MealMetaData> | void): Meal;
}

type EagerMealProgress = {
  readonly id: string;
  readonly name: string;
  readonly mealID: string;
  readonly totalWeight: number;
  readonly consumedWeight: number;
  readonly progressID: string;
  readonly userID: string;
  readonly progressDate?: string | null;
  readonly initialMeal?: string | null;
  readonly servingSize?: string | null;
  readonly servingUnit?: string | null;
  readonly servings?: string | null;
  readonly originalMeal?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMealProgress = {
  readonly id: string;
  readonly name: string;
  readonly mealID: string;
  readonly totalWeight: number;
  readonly consumedWeight: number;
  readonly progressID: string;
  readonly userID: string;
  readonly progressDate?: string | null;
  readonly initialMeal?: string | null;
  readonly servingSize?: string | null;
  readonly servingUnit?: string | null;
  readonly servings?: string | null;
  readonly originalMeal?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type MealProgress = LazyLoading extends LazyLoadingDisabled ? EagerMealProgress : LazyMealProgress

export declare const MealProgress: (new (init: ModelInit<MealProgress, MealProgressMetaData>) => MealProgress) & {
  copyOf(source: MealProgress, mutator: (draft: MutableModel<MealProgress, MealProgressMetaData>) => MutableModel<MealProgress, MealProgressMetaData> | void): MealProgress;
}

type EagerFoodProgress = {
  readonly id: string;
  readonly name: string;
  readonly kcal: number;
  readonly units: string;
  readonly protein: number;
  readonly carbs: number;
  readonly fat: number;
  readonly otherNutrition: string;
  readonly measures: string[];
  readonly healthLabels: string[];
  readonly totalWeight: number;
  readonly quantity: number;
  readonly img?: string | null;
  readonly edamamId?: string | null;
  readonly foodContentsLabel?: string | null;
  readonly category?: string | null;
  readonly progressID: string;
  readonly userID?: string | null;
  readonly public?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyFoodProgress = {
  readonly id: string;
  readonly name: string;
  readonly kcal: number;
  readonly units: string;
  readonly protein: number;
  readonly carbs: number;
  readonly fat: number;
  readonly otherNutrition: string;
  readonly measures: string[];
  readonly healthLabels: string[];
  readonly totalWeight: number;
  readonly quantity: number;
  readonly img?: string | null;
  readonly edamamId?: string | null;
  readonly foodContentsLabel?: string | null;
  readonly category?: string | null;
  readonly progressID: string;
  readonly userID?: string | null;
  readonly public?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type FoodProgress = LazyLoading extends LazyLoadingDisabled ? EagerFoodProgress : LazyFoodProgress

export declare const FoodProgress: (new (init: ModelInit<FoodProgress, FoodProgressMetaData>) => FoodProgress) & {
  copyOf(source: FoodProgress, mutator: (draft: MutableModel<FoodProgress, FoodProgressMetaData>) => MutableModel<FoodProgress, FoodProgressMetaData> | void): FoodProgress;
}

type EagerUser = {
  readonly id: string;
  readonly fat: number;
  readonly weight: number;
  readonly goal: Goal | keyof typeof Goal;
  readonly picture?: string | null;
  readonly username: string;
  readonly personalTrainer?: boolean | null;
  readonly foodProfessional?: boolean | null;
  readonly Progresses?: (Progress | null)[] | null;
  readonly Meals?: (Meal | null)[] | null;
  readonly Equiptments?: (Equiptment | null)[] | null;
  readonly Exercises?: (Exercise | null)[] | null;
  readonly sub: string;
  readonly ExerciseEquiptmentDetails?: (ExerciseEquiptmentDetail | null)[] | null;
  readonly Workouts?: (Workout | null)[] | null;
  readonly FoodProgresses?: (FoodProgress | null)[] | null;
  readonly MealProgresses?: (MealProgress | null)[] | null;
  readonly WorkoutPlays?: (WorkoutPlay | null)[] | null;
  readonly tier?: Tier | keyof typeof Tier | null;
  readonly Favorites?: (Favorite | null)[] | null;
  readonly Followers?: (Follower | null)[] | null;
  readonly numFollowers?: number | null;
  readonly Applications?: (Application | null)[] | null;
  readonly Ingredients?: (Ingredient | null)[] | null;
  readonly RunProgresses?: (RunProgress | null)[] | null;
  readonly WorkoutDetails?: (WorkoutDetails | null)[] | null;
  readonly WorkoutPlayDetails?: (WorkoutPlayDetail | null)[] | null;
  readonly WorkoutDetailModifiers?: (WorkoutDetailModifier | null)[] | null;
  readonly PantryItems?: (PantryItem | null)[] | null;
  readonly stripeId?: string | null;
  readonly stripeEnabled?: boolean | null;
  readonly Payouts?: (Payouts | null)[] | null;
  readonly categories?: (string | null)[] | null;
  readonly allergens?: (string | null)[] | null;
  readonly accepted_terms?: boolean | null;
  readonly bio?: string | null;
  readonly Comments?: (Comments | null)[] | null;
  readonly ReportsOfTerms?: (ReportsOfTerms | null)[] | null;
  readonly TaxReports?: (TaxReports | null)[] | null;
  readonly accepted_content_creator_terms?: boolean | null;
  readonly links?: (string | null)[] | null;
  readonly name?: string | null;
  readonly carbGoal?: number | null;
  readonly fatGoal?: number | null;
  readonly proteinGoal?: number | null;
  readonly selectedGoal?: string | null;
  readonly selectedSprite?: string | null;
  readonly Posts?: (Post | null)[] | null;
  readonly untitledfield?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUser = {
  readonly id: string;
  readonly fat: number;
  readonly weight: number;
  readonly goal: Goal | keyof typeof Goal;
  readonly picture?: string | null;
  readonly username: string;
  readonly personalTrainer?: boolean | null;
  readonly foodProfessional?: boolean | null;
  readonly Progresses: AsyncCollection<Progress>;
  readonly Meals: AsyncCollection<Meal>;
  readonly Equiptments: AsyncCollection<Equiptment>;
  readonly Exercises: AsyncCollection<Exercise>;
  readonly sub: string;
  readonly ExerciseEquiptmentDetails: AsyncCollection<ExerciseEquiptmentDetail>;
  readonly Workouts: AsyncCollection<Workout>;
  readonly FoodProgresses: AsyncCollection<FoodProgress>;
  readonly MealProgresses: AsyncCollection<MealProgress>;
  readonly WorkoutPlays: AsyncCollection<WorkoutPlay>;
  readonly tier?: Tier | keyof typeof Tier | null;
  readonly Favorites: AsyncCollection<Favorite>;
  readonly Followers: AsyncCollection<Follower>;
  readonly numFollowers?: number | null;
  readonly Applications: AsyncCollection<Application>;
  readonly Ingredients: AsyncCollection<Ingredient>;
  readonly RunProgresses: AsyncCollection<RunProgress>;
  readonly WorkoutDetails: AsyncCollection<WorkoutDetails>;
  readonly WorkoutPlayDetails: AsyncCollection<WorkoutPlayDetail>;
  readonly WorkoutDetailModifiers: AsyncCollection<WorkoutDetailModifier>;
  readonly PantryItems: AsyncCollection<PantryItem>;
  readonly stripeId?: string | null;
  readonly stripeEnabled?: boolean | null;
  readonly Payouts: AsyncCollection<Payouts>;
  readonly categories?: (string | null)[] | null;
  readonly allergens?: (string | null)[] | null;
  readonly accepted_terms?: boolean | null;
  readonly bio?: string | null;
  readonly Comments: AsyncCollection<Comments>;
  readonly ReportsOfTerms: AsyncCollection<ReportsOfTerms>;
  readonly TaxReports: AsyncCollection<TaxReports>;
  readonly accepted_content_creator_terms?: boolean | null;
  readonly links?: (string | null)[] | null;
  readonly name?: string | null;
  readonly carbGoal?: number | null;
  readonly fatGoal?: number | null;
  readonly proteinGoal?: number | null;
  readonly selectedGoal?: string | null;
  readonly selectedSprite?: string | null;
  readonly Posts: AsyncCollection<Post>;
  readonly untitledfield?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type User = LazyLoading extends LazyLoadingDisabled ? EagerUser : LazyUser

export declare const User: (new (init: ModelInit<User, UserMetaData>) => User) & {
  copyOf(source: User, mutator: (draft: MutableModel<User, UserMetaData>) => MutableModel<User, UserMetaData> | void): User;
}

type EagerProgress = {
  readonly id: string;
  readonly weight: number;
  readonly fat: number;
  readonly picture: string;
  readonly userID: string;
  readonly Food?: (FoodProgress | null)[] | null;
  readonly RunProgresses?: (RunProgress | null)[] | null;
  readonly MealProgresses?: (MealProgress | null)[] | null;
  readonly date?: string | null;
  readonly sub?: string | null;
  readonly water?: number | null;
  readonly activities?: (Activity | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyProgress = {
  readonly id: string;
  readonly weight: number;
  readonly fat: number;
  readonly picture: string;
  readonly userID: string;
  readonly Food: AsyncCollection<FoodProgress>;
  readonly RunProgresses: AsyncCollection<RunProgress>;
  readonly MealProgresses: AsyncCollection<MealProgress>;
  readonly date?: string | null;
  readonly sub?: string | null;
  readonly water?: number | null;
  readonly activities?: (Activity | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Progress = LazyLoading extends LazyLoadingDisabled ? EagerProgress : LazyProgress

export declare const Progress: (new (init: ModelInit<Progress, ProgressMetaData>) => Progress) & {
  copyOf(source: Progress, mutator: (draft: MutableModel<Progress, ProgressMetaData>) => MutableModel<Progress, ProgressMetaData> | void): Progress;
}