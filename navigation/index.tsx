import { FontAwesome } from '@expo/vector-icons';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { Text, View } from '../components/Themed';
import { ColorSchemeName, Pressable, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import NotFoundScreen from '../screens/NotFoundScreen';
import TabOneScreen from '../screens/TabOneScreen';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import { ExpoIcon } from '../components/ExpoIcon';
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


function RootNavigator() {
  const commonContext = useCommonAWSIds()
  const {userId} = commonContext
  if (userId) {
    return <Stack.Navigator initialRouteName={'Root'}>
    <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
    <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    <Stack.Screen name='Image'options={{headerShown: false, presentation: 'containedModal'}}>
      {props => <ImageDetailView uris={props.route?.params?.uris} defaultIndex={props.route?.params?.defaultIndex} />}
    </Stack.Screen>
    <Stack.Screen name='WorkoutPlay' options={{headerShown: false, gestureEnabled: false}}>
    {(props) => <WorkoutPlayScreen {...props} id={props.route.params.id} workoutId={props.route?.params?.workoutId}/>}
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
    <Stack.Screen name="Subscription" component={Subscription} options={{ headerShown: false }} />
    <Stack.Screen name="Help" component={Help} options={{ headerShown: false }} />
    <Stack.Screen name="About" component={About} options={{ headerShown: false }} />
    <Stack.Screen name='UserBio' component={Bio} options={{ headerShown: false }} />
    <Stack.Screen name="FinishedExercise" component={FinishedExercise} options={{ headerShown: false, gestureEnabled: false }} />
  </Stack.Navigator>
  }
  return (
    <Stack.Navigator initialRouteName={'GetStarted'}>
      <Stack.Screen name="GetStarted" component={GetStarted} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
      <Stack.Screen name="Registration" options={{ headerShown: false }}>
        {props => <PersonalInformation registration />}
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
  const dm = useColorScheme() ==='dark'
  const {setAiResult, setCurrentIngredietId} = useCommonAWSIds()
  const iconsAndColors = {
    'Home': {
      icon: "activity",
      label: 'Activity',
      color: dm ? "red-400" : "red-400"
    },
    'Exercise': {
      icon: "compass",
      label: 'For You',
      color: dm ? "yellow-400" : "yellow-500"
    },
    'Profile': {
      icon: "user",
      label: 'Profile',
      color: dm ? "white" : "gray-400"
    },
    'Food': {
      icon: "search",
      label: 'Search',
      color: dm ? "teal-600" : "teal-700"
    }
  };
  return (
    <View includeBackground style={[{ flexDirection: 'row' }, tw`h-23 items-center justify-between w-12/12 border-t border-${dm ? 'gray-600' : 'gray-400'}`]}>
      {state.routes.map((route, index) => {
        // @ts-ignore
        const { icon, color, label } = (iconsAndColors[route.name]) || {icon: 'home', color: 'red-500', label: 'Home'}
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

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
              {!isFocused && <ExpoIcon name={icon} iconName='feather' size={22} style={tw`text-${color}`} />}
              {isFocused && <View style={tw`items-center`}>
                <Text weight='bold' style={tw`text-center text-${isFocused ? color : 'gray-700'}`}>
                  {/* @ts-ignore */}
                  {label}
                </Text>
                <View style={tw`rounded-full h-2 w-2 mt-1 bg-${color}`} />
              </View>
              }
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

