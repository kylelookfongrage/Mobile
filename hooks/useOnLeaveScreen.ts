import { View, Text } from 'react-native'
import React, { useEffect } from 'react'

export default function useOnLeaveScreen(f: () => void) {
  useEffect(() => {
    return () => {
        f();
    }
  }, []) 
}