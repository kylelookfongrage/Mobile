import * as React from 'react';
import { Colors, FAB, Portal, Provider } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme';
import { FlatList } from 'react-native-gesture-handler';
import { _tokens } from '../../tamagui.config';

interface FloatingActionButtonProps {
    options: {
        name?: string;
        icon: IconSource;
        onPress?: () => void
    }[],
    bgColor?: string;
    hexBgColor?: string;
    initialIcon: IconSource;
    openIcon: IconSource;
    color?: string;
}

export const FloatingActionButton = (props: FloatingActionButtonProps) => {
  const [state, setState] = React.useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;
  const dm = useColorScheme() === 'dark'
  const fabColor = props.color || 'white'
  return (
    <Provider>
      <Portal>
        <FAB.Group
          open={open}
          visible
          fabStyle={{backgroundColor: _tokens.primary900}}
          icon={open ? props.openIcon : props.initialIcon}
          actions={(props.options||[]).map((x) => ({label: x.name, style:tw`flex-row px-0 items-center justify-center pl-1`, icon: x.icon, onPress: () => {
            x.onPress && x.onPress()
          }}))}
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
              // do something if the speed dial is open
            }
          }}
        />
      </Portal>
    </Provider>
  );
};


