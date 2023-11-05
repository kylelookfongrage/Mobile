import { View, Text } from '../base/Themed'
import React, { useEffect, useState } from 'react'
import { useCommonAWSIds } from '../../hooks/useCommonContext';

export default function Reviews(props: {mealId?: string; userId?: string; workoutId?: string; fitnessPlanId?: string}) {
    const {mealId, userId, workoutId, fitnessPlanId} = props;
    const [userReview, setUserReview] = useState<any | null>(null);
    const [reviews, setReviews] = useState<any[]>([])
    const ids = useCommonAWSIds()
    const [newReview, setNewReview] = useState<{rating: number; description: string; title: string; }>({rating: 0, description: '', title: ""})

    

    if (!mealId && !userId && !workoutId && !fitnessPlanId) return <View />
  return (
    <View>
      <Text>Reviews</Text>
    </View>
  )
}