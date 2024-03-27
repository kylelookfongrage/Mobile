/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Modal: undefined;
  NotFound: undefined;
  WorkoutPlay: {id: string; workoutId?: string;}
  Image: {uris: string[], defaultIndex?: number | undefined};
  Run: undefined;
  Settings: undefined;
  Apply: undefined;
  PersonalInformation: undefined;
  Subscription: undefined;
  Help: undefined;
  About: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  GetStarted: undefined;
  Registration: undefined;
  GenerateMeal: undefined;
  Account: undefined;
  ChangePassword: undefined;
  NewChat: undefined;
  UpdateEmail: undefined;
  DeleteAccount: undefined;
  FinishedExercise: undefined;
  Allergens: undefined;
  UserBio: undefined;
  ShowMore: undefined;
  Profile: undefined;
  Report: undefined;
  EditDashboard: undefined;
  SummaryEdit: undefined;
  SummaryMetric: {weight?: boolean};
  Quiz: undefined;
  SelectSprite: undefined;
  RegistrationEdit: undefined;
  MakePost: undefined;
  Inbox: undefined;
  Message: {id: string};
  ChatDetail: {id: string};
  Setup: undefined;
  OnboardingComplete: undefined;
  ScanBarcode: undefined;
  LineChartData: undefined;
  ProgressPicture: undefined; 
};


export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type RootTabParamList = {
  Home: undefined;
  Exercise: undefined;
  Food: undefined;
  Profile: undefined
  History: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;
