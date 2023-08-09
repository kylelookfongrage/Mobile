import * as React from "react";
import { Pressable, View } from "react-native";
import {
  Button,
  Menu,
  Divider,
  Provider as PaperProvider,
} from "react-native-paper";

type MenuViewProps = View["props"] & {
  menuItems: {
    title: string;
    onPress: () => void;
    includeDivider?: boolean;
    otherProps?: any;
  }[];
};
const MenuView = (props: MenuViewProps) => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => {
    console.log("should open menu");
    setVisible(true);
  };

  const closeMenu = () => setVisible(false);

  //   return (
  //     <PaperProvider>
  //       <View {...props}>
  //         <Menu
  //           visible={visible}
  //           onDismiss={closeMenu}
  //           anchor={
  //             <Button onPress={openMenu}>
  //               {props.children && props.children}
  //             </Button>
  //           }
  //         >
  //           <Menu.Item onPress={() => {}} title="Redo" />
  //           <Menu.Item onPress={() => {}} title="Undo" />
  //           {/* {props.menuItems.map(item => {
  //             return <Menu.Item key={item.title} title={item.title} onPress={item.onPress} {...item.otherProps} />
  //           })} */}
  //         </Menu>
  //       </View>
  //     </PaperProvider>
  //   );
  return (
    <PaperProvider>
      <View
        style={{
          paddingTop: 50,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={<Button onPress={openMenu}>Show menu</Button>}
        >
          <Menu.Item onPress={() => {}} title="Item 1" />
          <Menu.Item onPress={() => {}} title="Item 2" />
          <Divider />
          <Menu.Item onPress={() => {}} title="Item 3" />
        </Menu>
      </View>
    </PaperProvider>
  );
};

export default MenuView;
