import { View, Text } from './Themed'
import React, { useEffect, useState } from 'react'
import { Review } from '../aws/models';
import { DataStore } from 'aws-amplify';
import moment, { min } from 'moment';
import { useCommonAWSIds } from '../hooks/useCommonContext';

export default function Reviews(props: {mealId?: string; userId?: string; workoutId?: string; fitnessPlanId?: string}) {
    const {mealId, userId, workoutId, fitnessPlanId} = props;
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [reviews, setReviews] = useState<Review[]>([])
    const ids = useCommonAWSIds()
    const [newReview, setNewReview] = useState<{rating: number; description: string; title: string; }>({rating: 0, description: '', title: ""})

    useEffect(() => {
        (async () => {
            try {
                if (!mealId || !userId || !workoutId || !fitnessPlanId) return
                const r = await DataStore.query(Review, x => x.and(rev => [
                    rev.createdAt.ge(moment().utc().subtract(1, 'year').format()),
                    (mealId ? rev.mealID.eq(mealId) : (userId ? rev.userID.eq(userId) : (workoutId ? rev.workoutID.eq(workoutId) : rev.createdAt.ne(''))))
                ]))
                setReviews(r)
                let potentialUserReview =  await DataStore.query(Review, x => x.and(rev => [
                    rev.from.eq(ids.userId),
                    (mealId ? rev.mealID.eq(mealId) : (userId ? rev.userID.eq(userId) : (workoutId ? rev.workoutID.eq(workoutId) : rev.createdAt.ne(''))))
                ]))
                setUserReview(potentialUserReview[0] || null)
            } catch (error) {
                
            }
        })()
    }, [])

    if (!mealId && !userId && !workoutId && !fitnessPlanId) return <View />
  return (
    <View>
      <Text>Reviews</Text>
    </View>
  )
}