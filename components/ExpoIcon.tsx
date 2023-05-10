import {
    MaterialCommunityIcons,
    Ionicons,
    Feather,
    Octicons,
    FontAwesome5,
    SimpleLineIcons,
  } from "@expo/vector-icons";
  
  interface getIconProps {
    name: string;
    iconName?: "material" | "ion" | "feather" | "oct" | "fa5" | "line";
    size?: number;
    color?: string;
    style?: any;
  }
  
  export const ExpoIcon = (props: getIconProps) => {
    const { name, size, color, style, iconName } = props;
    const iconProps = { size, color, style, name };
    let I: any;
    switch (iconName) {
      case "material":
        //@ts-ignore
        return <MaterialCommunityIcons {...iconProps} />;
      case "fa5":
        return <FontAwesome5 {...iconProps} />;
      case "feather":
        //@ts-ignore
        return <Feather {...iconProps} />;
      case "ion":
        //@ts-ignore
        return <Ionicons {...iconProps} />;
      case "line":
        //@ts-ignore
        return <SimpleLineIcons {...iconProps} />;
      default:
        //@ts-ignore
        return <Octicons {...iconProps} />;
    }
  };
  