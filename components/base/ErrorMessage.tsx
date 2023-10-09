import { useColorScheme } from "react-native";
import tw from 'twrnc'
import { Text } from "./Themed";
import { View, TouchableOpacity } from "react-native";
import { ExpoIcon } from "./ExpoIcon";

interface ErrorMessageProps {
    errors: string[];
    onDismissTap?: () => void;
  }
  export const ErrorMessage = (props: ErrorMessageProps) => {
    const dm = useColorScheme() === 'dark'
    const { errors } = props;
    if (errors.length === 0) return <View />
    return <View style={tw`flex-row items-center justify-between rounded-lg bg-red-${dm ? '700' : '300'} p-4`}>
      <View style={tw`items-start max-w-11/12`}>
        {errors.map((e, i) => {
          return <Text style={tw``} key={i}>{e}</Text>
        })}
      </View>
      <TouchableOpacity onPress={() => {
        props.onDismissTap && props.onDismissTap()
      }}>
        <ExpoIcon name='x-circle' size={25} color='white' iconName='feather' />
      </TouchableOpacity>
    </View>
  }