import { FontAwesome } from '@expo/vector-icons';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { Text, View } from '../components/base/Themed';
import { ColorSchemeName, Pressable, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import NotFoundScreen from '../screens/NotFoundScreen';
import TabOneScreen from '../screens/TabOneScreen';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import { ExpoIcon, Icon } from '../components/base/ExpoIcon';
import WorkoutPlayScreen from '../screens/workout/WorkoutPlay';
import WorkoutTab from '../screens/workout/WorkoutTab';
import FoodTab from '../screens/diet/FoodTab';
import Login from '../screens/onboarding/Login';
import GetStarted from '../screens/onboarding/GetStarted';
import RunTracker from '../screens/home/Run';
import ImageDetailView from '../screens/home/ImageDetailView';




export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();
import { useCommonAWSIds } from '../hooks/useCommonContext';
import Settings from '../screens/home/Settings';
import ProfileScreen from '../screens/home/ProfileScreen';
import PersonalInformation from '../screens/home/PersonalInformation';
import Apply from '../screens/home/Apply';
import Subscription from '../screens/home/Subscription';
import Help from '../screens/home/Help';
import About from '../screens/home/About';
import Account from '../screens/home/Account';
import ChangePassword from '../screens/home/ChangePassword';
import UpdateEmail from '../screens/home/UpdateEmail';
import DeleteAccount from '../screens/home/DeleteAccount';
import ForgotPassword from '../screens/onboarding/ForgotPassword';
import FinishedExercise from '../screens/workout/FinishedExercise';
import Bio from '../screens/home/Bio';
import ShowMore from '../screens/home/ShowMore';
import Profile from '../screens/home/Profile';
import Report from '../screens/home/Report';
import SummaryMetric from '../screens/home/SummaryMetric';
import SelectSprite from '../screens/workout/SelectSprite';
import MakePost from '../screens/workout/MakePost';
import Inbox from '../screens/workout/Inbox';
import Message from '../screens/workout/Message';
import { getCommonScreens } from '../components/screens/GetCommonScreens';
import NewChat from '../screens/workout/NewChat';
import ChatDetail from '../screens/workout/ChatDetail';
import Setup from '../screens/onboarding/Setup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingComplete from '../screens/onboarding/OnboardingComplete';
import VideoScreen from '../screens/other/VideoScreen';
import { useSelector } from '../redux/store';
import { _tokens } from '../tamagui.config';
import Spacer from '../components/base/Spacer';


function RootNavigator() {
  let profile = useSelector(x => x.auth.profile)
  const commonContext = useCommonAWSIds()
  if (profile?.id) {
    return <Stack.Navigator initialRouteName={'Root'}>
      <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Screen name='Image' options={{ headerShown: false, presentation: 'containedModal' }}>
        {props => <ImageDetailView uris={props.route?.params?.uris} defaultIndex={props.route?.params?.defaultIndex} />}
      </Stack.Screen>
      <Stack.Screen name='Video' options={{ headerShown: false, presentation: 'containedModal' }}>
        {props => <VideoScreen uri={props.route?.params?.uri}/>}
      </Stack.Screen>
      <Stack.Screen name='WorkoutPlay' options={{ headerShown: false, gestureEnabled: false }}>
        {(props) => <WorkoutPlayScreen {...props} id={props.route.params.id} workoutId={props.route?.params?.workoutId} />}
      </Stack.Screen>
      <Stack.Screen name="Run" options={{ headerShown: false }}>
        {/* @ts-ignore */}
        {(props) => <RunTracker id={props?.route?.params?.id} />}
      </Stack.Screen>
      <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ headerShown: false }} />
      <Stack.Screen name="UpdateEmail" component={UpdateEmail} options={{ headerShown: false }} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccount} options={{ headerShown: false }} />
      <Stack.Screen name="PersonalInformation" component={PersonalInformation} options={{ headerShown: false }} />
      <Stack.Screen name="Apply" component={Apply} options={{ headerShown: false }} />
      <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
      <Stack.Screen name="Inbox" component={Inbox} options={{ headerShown: false }} />
      <Stack.Screen name="Message" options={{ headerShown: false }}>
        {props => <Message id={props.route?.params?.id} />}
      </Stack.Screen>
      <Stack.Screen name="ChatDetail" options={{ headerShown: false }}>
        {props => <ChatDetail id={props.route?.params?.id} />}
      </Stack.Screen>
      <Stack.Screen name="Subscription" component={Subscription} options={{ headerShown: false }} />
      <Stack.Screen name="Help" component={Help} options={{ headerShown: false }} />
      <Stack.Screen name="About" component={About} options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingComplete} options={{ headerShown: false }} />
      <Stack.Screen name="Setup" component={Setup} options={{ headerShown: false }} />
      <Stack.Screen name="NewChat" component={NewChat} options={{ headerShown: false, presentation: 'transparentModal', gestureEnabled: true, gestureDirection: 'vertical', fullScreenGestureEnabled: true }} />
      <Stack.Screen name="SelectSprite" component={SelectSprite} options={{ headerShown: false, presentation: 'transparentModal' }} />
      <Stack.Screen name='UserBio' component={Bio} options={{ headerShown: false }} />
      <Stack.Screen name="FinishedExercise" component={FinishedExercise} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="ShowMore" options={{ headerShown: false, presentation: 'transparentModal' }}>
        {props => <ShowMore
          // @ts-ignore
          name={props.route?.params?.name} type={props.route?.params?.type} id={props.route?.params?.id}
          // @ts-ignore
          desc={props.route?.params?.desc} img={props.route?.params?.img} userId={props.route?.params?.userId}
        />}
      </Stack.Screen>
      <Stack.Screen name={'Profile'} options={{ headerShown: false }}>
        {/* @ts-ignore */}
        {props => <Profile {...props} id={props.route?.params?.id} personal={false} registration={false} />}
      </Stack.Screen>
      {getCommonScreens('', Stack)}
      <Stack.Screen name={'Report'} options={{ headerShown: false }}>
        {/* @ts-ignore */}
        {props => <Report {...props} // @ts-ignore
          name={props.route?.params?.name} type={props.route?.params?.type} id={props.route?.params?.id}
          // @ts-ignore
          desc={props.route?.params?.desc} img={props.route?.params?.img} userId={props.route?.params?.userId} />}
      </Stack.Screen>
      <Stack.Screen name={'RegistrationEdit'} options={{ headerShown: false }}>
        {/* @ts-ignore */}
        {props => <SummaryEdit {...props} registration />}
      </Stack.Screen>
      <Stack.Screen name={'SummaryMetric'} options={{ headerShown: false, presentation: 'transparentModal' }}>
        {/* @ts-ignore */}
        {props => <SummaryMetric {...props} weight={props.route?.params?.weight} />}
      </Stack.Screen>
      <Stack.Screen name='MakePost' options={{headerShown: false, gestureEnabled: true, gestureDirection: 'vertical', fullScreenGestureEnabled: true}}>
          {props => <MakePost 
            //@ts-ignore
            workoutId={props.route?.params?.workoutId}
            //@ts-ignore
            mealId={props.route?.params?.mealId}
            //@ts-ignore
            exerciseId={props.route?.params?.exerciseId}
            //@ts-ignore
            runProgressId={props.route?.params?.runProgressId}
            //@ts-ignore
            description={props.route?.params?.description}
            //@ts-ignore
            media={props.route?.params?.media}
            
          />}
      </Stack.Screen> 
    </Stack.Navigator>
  }
  return (
    <Stack.Navigator initialRouteName={'GetStarted'}>
      <Stack.Screen name="GetStarted" component={GetStarted} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
      <Stack.Screen name="Registration" options={{ headerShown: false }}>
        {props => <Setup registration />}
      </Stack.Screen>
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: false,
      }}>
      <BottomTab.Screen
        name="Home"
        // @ts-ignore
        component={TabOneScreen}
        options={({ navigation }: RootTabScreenProps<'Home'>) => ({
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('Modal')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome
                name="info-circle"
                size={25}
                color={Colors[colorScheme].text}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        })}
      />
      <BottomTab.Screen
        name="Exercise"
        component={WorkoutTab}
        options={{
          tabBarShowLabel: false
        }}
      />
      <BottomTab.Screen
        name="Food"
        component={FoodTab}
        options={{
          tabBarShowLabel: false,
        }}
      />
      <BottomTab.Screen
        name="History"
        component={FoodTab}
        options={{
          tabBarShowLabel: false,
        }}
      />
      <BottomTab.Screen
        name="Profile"
        options={{
          tabBarShowLabel: false,
        }}
      >
        {props => <ProfileScreen />}
      </BottomTab.Screen>
    </BottomTab.Navigator>
  );
}

function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const dm = useColorScheme() === 'dark'
  const { setAiResult, setCurrentIngredietId } = useCommonAWSIds()

  const iconsAndColors = {
    'Home': {
      icon: "Home",
      label: 'Home',
      color: dm ? "red-600" : "red-500"
    },
    'Exercise': {
      icon: "Discovery",
      label: 'Discover',
      color: dm ? "red-600" : "red-500"
    },
    'History' : {
      icon: 'Chart',
      label: 'History',
      color: dm ? 'white' : 'black',
      onPress: () => {}
    },
    'Profile': {
      icon: "Profile",
      label: 'Profile',
      color: dm ? "red-600" : "red-500"
    },
    'Food': {
      icon: "Search",
      label: 'Search',
      color: dm ? "red-600" : "red-500"
    }
  };
  const insets = useSafeAreaInsets()
  return (
    <View includeBackground style={[{ flexDirection: 'row', paddingBottom: insets.bottom}, tw`pt-3 items-center justify-between w-12/12`]}>
      {state.routes.map((route, index) => {
        // @ts-ignore
        const { icon, color: c, label } = (iconsAndColors[route.name]) || { icon: 'home', color: 'red-500', label: 'Home' }
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        let color = (focused: boolean) => focused ? (dm ? _tokens.white : _tokens.primary900) : _tokens.gray500


        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (route.name === 'Food') {
            setAiResult(null)
            setCurrentIngredietId(null)
          }

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            // @ts-ignore
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[{ flex: 1 }, tw`p-2`]}
          >
            <View style={tw`items-center`}>
            <Icon name={icon} weight={isFocused ? 'bold' : 'light'} size={20} 
              // style={tw`text-${color}`}
              color={color(isFocused)}
               />
               <Spacer xs />
              <Text xs weight={isFocused ? 'bold' : 'semibold'} style={{...tw`text-center`, color: color(isFocused)}}>
                  {/* @ts-ignore */}
                  {label}
                </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

