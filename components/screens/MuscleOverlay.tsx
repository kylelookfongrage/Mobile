import React, { useEffect, useMemo, useState } from "react";
import tw from 'twrnc'
import { useGet } from "../../hooks/useGet";
import { Muscles } from "../../assets/muscles/muscles";
import Overlay from "./Overlay";
import { View, Text } from "../base/Themed";
import { Image, ScrollView } from "react-native";
import Spacer from "../base/Spacer";
import { _tokens } from "../../tamagui.config";
import { ExpoIcon } from "../base/ExpoIcon";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";

export default function MuscleOverlay(props: {onSelect?: (items: (keyof typeof Muscles)[]) => void; selected?: (keyof typeof Muscles)[], visible: boolean, onDismiss: () => void}) {
    let g = useGet()
    const dm = g.dm
    const muscles = Object.keys(Muscles) as (keyof typeof Muscles)[]
    let [selectedMuscles, setSelectedMuscles] = useState<(keyof typeof Muscles)[]>([])
    const [selectedEquipment, setSelectedEquipment] = useState<keyof typeof Muscles | null>(null)
    useEffect(() => {
        setSelectedMuscles(props.selected)
    }, [props.selected])
    return (
        <Overlay clearBackground dialogueHeight={65} id="muscles-overlay" visible={props.visible} onDismiss={() => {
            props.onSelect && props.onSelect(selectedMuscles)
            props.onDismiss && props.onDismiss()
        }}>
        <Text h4 bold>Muscles</Text>
            <Spacer  />
            <View style={tw`flex-row items-center flex-wrap self-center w-12/12`}>
                {muscles.map(item => {
                    const selected = (selectedMuscles).includes(item)
                    return <TouchableOpacity style={tw`ml-1`} onLongPress={() => setSelectedEquipment(item)} onPress={() => {
                        if (selected) {
                            setSelectedMuscles(p => [...(p || [])].filter(x => x !== item))
                        } else {
                            setSelectedMuscles(p => [...(p || []), item])
                        }
                    }} key={`Muscle=` + item}>
                        <MuscleTile item={item} selected={selected} />
                    </TouchableOpacity>
                })}
            </View>
            <Spacer xl/>
        </Overlay>
    )
}

export const MuscleTile = (props: {item: keyof typeof Muscles, selected?: boolean}) => {
    let g = useGet()
    let dm = g.dm
    const borderRadius = (g.s.width * 0.3) / 15
    let {item: _item, selected: _selected} = props;
    let {item, selected} = useMemo(() => ({item: _item, selected: _selected}), [props.selected, props.item])
    return <View style={{width: g.s.width * 0.3, height: g.s.width * 0.3, borderRadius: borderRadius, backgroundColor: (dm ? _tokens.dark2 : _tokens.gray200) + '90',  ...tw`items-center mb-2`}}>
        <View style={{...tw`w-12/12 py-1`, backgroundColor: selected ? _tokens.primary900 : (dm ? _tokens.dark2 : _tokens.gray200), borderTopRightRadius: borderRadius, borderTopLeftRadius: borderRadius}}>
        <View style={tw`flex-row items-center ${selected ? 'justify-between px-1' : 'justify-center'}`}>
        <Text bold center white={selected}>{item}</Text>
        {selected && <ExpoIcon name="checkbox" iconName="ion" size={15} color="white" />}
        </View>
        </View>
        <Image source={Muscles[item].image} style={tw`h-9/12 w-9/12`} />
    </View>
}