import { View, Text } from 'react-native'
import React, { useEffect } from 'react'

export default function useAsync(fun: () => Promise<any>, deps: any[]) {
  useEffect(() => {
    (async _ => {
        return await fun()
    })()
  }, deps)
}