import { View, Text } from '../base/Themed'
import React, { useEffect, useState } from 'react'
import { useSelector } from '../../redux/store';

export default function Reviews(props: {mealId?: string; userId?: string; workoutId?: string; fitnessPlanId?: string}) {
    const {mealId, userId, workoutId, fitnessPlanId} = props;
    const [userReview, setUserReview] = useState<any | null>(null);
    const [reviews, setReviews] = useState<any[]>([])
    const ids = useSelector(x => x.auth)
    const [newReview, setNewReview] = useState<{rating: number; description: string; title: string; }>({rating: 0, description: '', title: ""})

    

    if (!mealId && !userId && !workoutId && !fitnessPlanId) return <View />
  return (
    <View>
      <Text>Reviews</Text>
    </View>
  )
}