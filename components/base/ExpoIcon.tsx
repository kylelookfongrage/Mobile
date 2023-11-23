import {
    MaterialCommunityIcons,
    Ionicons,
    Feather,
    Octicons,
    FontAwesome5,
    SimpleLineIcons,
    createIconSet
  } from "@expo/vector-icons";

  let uncicodeMapping = require('../../assets/fonts/unicodesMap.json')


  let Iconly = createIconSet(uncicodeMapping, 'Iconly', 'Iconly.ttf')
  
  interface getIconProps {
    name: string;
    iconName?: "material" | "ion" | "feather" | "oct" | "fa5" | "line";
    size?: number;
    color?: string;
    style?: any;
  }


  interface IconProps {
    name: string,
    size?: number;
    color?: string;
    style?: any;
    weight?: 'light' | 'bold' | 'sharp';
  }

  export const Icon = (props: IconProps) => {
    const {name, size, color, style, weight} = props;
    let obj: any = {size, color, style}
    obj['size'] = size || 20
    obj['name'] = 'icon-' + name
    if (weight == 'bold') obj['name'] += '-1'
    if (weight == 'sharp') obj['name'] += '-2'
    //@ts-ignore
    return <Iconly {...obj} />
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
        //@ts-ignore
        return <FontAwesome5 {...iconProps} />;
      case "feather":
        //@ts-ignore
        return <Feather {...iconProps} />;
      case 'oct': 
        //@ts-ignore
        return <Octicons {...iconProps} />
      case "ion":
        //@ts-ignore
        return <Ionicons {...iconProps} />;
      case "line":
        //@ts-ignore
        return <SimpleLineIcons {...iconProps} />;
      default:
        // @ts-ignore
        return <Iconly {...iconProps} />;
    }
  };
  