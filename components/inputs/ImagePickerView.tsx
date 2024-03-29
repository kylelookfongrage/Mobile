import Animated from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  TouchableOpacity,
  useColorScheme,
  View,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { Video } from "../base/Video";
import { ExpoIcon, Icon } from "../base/ExpoIcon";
import tw from "twrnc";
import { Text } from "../base/Themed";
import { MediaType, defaultImage, isStorageUri } from "../../data";
import { useStorage } from "../../supabase/storage";
import { ActionSheet } from "react-native-ui-lib";
import { useGet } from "../../hooks/useGet";
import { _tokens } from "../../tamagui.config";

interface ImagePickerViewProps {
  srcs?: MediaType[];
  type?: "video" | "image" | "all";
  onChange?: (media: MediaType[]) => void;
  onFinishSelect?: (media: MediaType) => void;
  wide?: boolean;
  imageStyle?: any;
  pt?: number;
  editable?: boolean;
  resizeMode?: any;
  multiple?: boolean;
  snapTo?: number;
  height?: number;
  indicatorMarginTop?: number;
  standalone?: boolean;
}
export const ImagePickerView = (props: ImagePickerViewProps) => {
  let mediaType = ImagePicker.MediaTypeOptions.All;
  if (props.type === "image") mediaType = ImagePicker.MediaTypeOptions.Images;
  if (props.type === "video") mediaType = ImagePicker.MediaTypeOptions.Videos;
  const currentMediaPermissions = ImagePicker.useMediaLibraryPermissions();
  const currentCameraPermissions = ImagePicker.useCameraPermissions();
  const s = useStorage();

  const setMedia = async (camera: boolean) => {
    const settings = {
      mediaTypes: mediaType,
      aspect: [9, 16],
      allowsEditing: true,
      quality: 1,
    };
    //@ts-ignore
    const result = await (camera
      ? ImagePicker.launchCameraAsync({ ...settings })
      : ImagePicker.launchImageLibraryAsync({ ...settings }));
    if (result && result.assets && result.assets.length > 0) {
      const res = result.assets[0];
      props.onChange &&
        props.onChange([
          ...(props.srcs || []),
          { uri: res.uri, type: res.type || "image" },
        ]);
      props.onFinishSelect &&
        props.onFinishSelect({ uri: res.uri, type: res.type || "image" });
    //   if (scrollRef && scrollRef.current) {
    //     const pos = mediaSources.length * width;
    //     scrollRef.current.scrollTo({ x: pos, y: 0, animated: true });
    //   }
    }
    setShowAction(false);
  };
  const pickMedia = async (camera: boolean) => {
    if (camera) {
      if (
        !currentCameraPermissions[0] ||
        !currentCameraPermissions[0]?.granted
      ) {
        const hasAccess = (await ImagePicker.requestCameraPermissionsAsync())
          .granted;
        if (hasAccess) {
          await setMedia(camera);
        } else {
          setShowAction(false);
          alert(
            "We need your access to the camera, please go to your settings."
          );
        }
      } else {
        await setMedia(camera);
      }
    } else {
      if (!currentMediaPermissions[0] || !currentMediaPermissions[0]?.granted) {
        const hasAccess = (
          await ImagePicker.requestMediaLibraryPermissionsAsync()
        ).granted;
        if (hasAccess) {
          await setMedia(camera);
        } else {
          setShowAction(false);
          alert(
            "We need your access to the camera roll, please go to your settings."
          );
        }
      } else {
        setMedia(camera);
      }
    }
  };

  let mediaSources: MediaType[] = useMemo(() => {
    if (props.srcs && props.srcs.length > 0) {
      return props.srcs.map((x) => {
        if (isStorageUri(x.uri || defaultImage)) {
          const url = s.constructUrl(x.uri || defaultImage);
          return { uri: url.data.publicUrl, type: x.type, awsId: x.uri };
        } else {
          return x;
        }
      });
    } else {
      return [];
    }
  }, [props.srcs]);


  const onDelete = (uri: string) => {
    console.log('deleting')
    if (props.onChange) {
      if (!props.multiple) {props.onChange([])}
      else {
        props.onChange((props.srcs || []).filter((x) => x.uri !== uri && x.supabaseID !== uri));
      }
    }
  };

  const styles = StyleSheet.create({
    img: {
      width: Dimensions.get("screen").width,
      height: props.height || Dimensions.get("screen").height * 0.55,
    },
  });
  const dm = useColorScheme() === "dark";

  const scrollX = useRef(new Animated.Value(0)).current;

  const width = Dimensions.get("screen").width;
  const scrollRef = useRef<ScrollView>(null);
  const navigator = useNavigation();
  const [showAction, setShowAction] = useState(false);
  let g = useGet()

  return (
    <View style={[{ flex: 1 }, tw`bg-${dm ? "gray-800" : "gray-200"}`]}>
      <Animated.ScrollView
        nestedScrollEnabled={props.multiple}
        scrollEnabled={props.multiple}
        onScroll={Animated.event([
          {
            nativeEvent: {
              contentOffset: {
                x: scrollX,
              },
            },
            // @ts-ignore
          },
        ])}
        horizontal={props.multiple}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ref={scrollRef}
        decelerationRate={0.5}
        scrollEventThrottle={16}
        snapToInterval={props.snapTo || width}
        // @ts-ignore
        contentContainerStyle={[
          tw`${mediaSources.length === 0 ? "py-20" : ""} justify-center`,
        ]}
        style={{ height: styles.img.height }}
      >
        {/* Image */}
        {mediaSources.map((imageSource: MediaType, i) => {
          //@ts-ignore
          return (
            <View
              key={i}
              style={[
                tw` items-center ${props.pt ? "pt-" + props.pt : ""}`,
                {
                  width: props.snapTo || Dimensions.get("screen").width,
                },
              ]}
            >
              {mediaSources.length > 1 && (
                <View
                  style={[
                    { position: "absolute", top: 40, right: 20, zIndex: 1 },
                    tw`py-2 px-4 bg-gray-${dm ? "700" : "300"} rounded-lg`,
                  ]}
                >
                  {i === mediaSources.length - 1 && props.editable && (
                    <Text style={tw``}>Scroll to add</Text>
                  )}
                  {(i !== mediaSources.length - 1 || !props.editable) && (
                    <Text style={tw``}>
                      {i + 1}/{mediaSources.length}
                    </Text>
                  )}
                </View>
              )}
              {imageSource && imageSource.type === "image" && (
                <TouchableOpacity
                  onPress={() => {
                    const numberOfVideos = mediaSources.filter(
                      (x) => x.type === "video"
                    ).length;
                    //@ts-ignore
                    navigator.navigate("Image", {
                      uris: mediaSources
                        .filter((x) => x.type === "image")
                        .map((x) => x.uri),
                      defaultIndex: i < numberOfVideos ? i : i - numberOfVideos,
                    });
                  }}
                >
                  <Image
                    resizeMethod={props.resizeMode || "auto"}
                    source={{ uri: imageSource.uri }}
                    style={props.imageStyle ? props.imageStyle : styles.img}
                  />
                </TouchableOpacity>
              )}
              {imageSource && imageSource.type === "video" && (
                <View style={tw``}>
                  <Video
                    indicatorMarginTop={props.standalone ? undefined : props.indicatorMarginTop ? props.indicatorMarginTop : -20}
                    indicatorMarginBottom={props.standalone ? undefined : 30}
                    source={{ uri: imageSource.uri }}
                    // @ts-ignore
                    resizeMode={props.resizeMode || "cover"}
                    style={styles.img}
                    
                  />
                </View>
              )}
              {props.editable === true && (
                <TouchableOpacity
                  style={[{position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 50, right: 0, marginTop: -20, paddingTop: 20, paddingBottom: 15, paddingHorizontal: 10, zIndex: 40000000}]}
                  onPress={() => onDelete(imageSource.uri)}
                >
                 <Icon name="Delete" weight="bold" size={25} color={_tokens.error} />
                    <Text bold>
                      Remove
                    </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        {props.editable !== false && (
          <View
            style={[
              tw`flex-row items-center justify-center`,
              {
                width: props.snapTo || Dimensions.get("screen").width,
                height: styles.img.height,
              },
            ]}
          >
            <TouchableOpacity
              style={{position: 'absolute', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', bottom: g.s.height * 0.38}}
              onPress={() => setShowAction(true)}
            >
              <Text style={tw``}>
                {props.multiple !== true && mediaSources.length > 0
                  ? "Replace"
                  : "Pick"}{" "}
                a
                {props.type === "image"
                  ? "n image"
                  : props.type === "video"
                  ? " video"
                  : "n image or video"}
              </Text>
            </TouchableOpacity>
            <ActionSheet
              visible={showAction}
              cancelButtonIndex={2}
              destructiveButtonIndex={2}
              useNativeIOS={Platform.OS === "ios"}
              options={[
                {
                  label: "From Media Library",
                  onPress: async () => {
                    await pickMedia(false);
                  },
                },
                {
                  label: "Take Picture",
                  onPress: async () => {
                    await pickMedia(true);
                  },
                },
                {
                  label: "Cancel",
                  onPress: () => {
                    setShowAction(false);
                  },
                },
              ]}
            />
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};
