import { DataStore } from "aws-amplify";
import { useEffect, useState } from "react";
import { ZenObservable } from "zen-observable-ts";
import { Badge, BadgeProgress, LazyBadgeProgress, User } from "../aws/models";
import { useCommonAWSIds } from "./useCommonContext";

export enum BadgeType {
    progress='numProgress', 
    weightDiff='weightDifference', 
    numWorkouts='numWorkouts', 
    numFood='numFoodOrMeals',
    numFollowers='numFollowers', 
    numContent='numContent', 
    fatDiff='bodyFatDifference', 
    payouts='payouts', 
    photos='numProgressPhotots', 
    weight='numWeight', 
    reps='numReps', 
    runs='numRuns',
    time='numTime', 
    reports='numReports', 
}


export function useBadges(fetchData: boolean=true, value=0) {
    const [badgeProgress, setBadgeProgress] = useState<BadgeProgress | null>(null)
    const [badges, setBadges] = useState<Badge[]>([])
    const {userId} = useCommonAWSIds();
    const [newBadges, setNewBadges] = useState<Badge[]>([])
    async function logProgress(type: BadgeType): Promise<LazyBadgeProgress | null>{
        let og = (await DataStore.query(BadgeProgress, b => b.User.id.eq(userId)))?.[0]
        let user = await DataStore.query(User, userId)
        let id: LazyBadgeProgress | null = null;
        let keys = Object.keys(BadgeType)
        if (!og) {
            if (user) {
                let document = {User: user}
                for (var k of keys) {
                    //@ts-ignore
                    let documentKey = BadgeType[k]
                    //@ts-ignore
                    document[documentKey] = type == documentKey ? (value ? value : 1) : 0
                }
                //@ts-ignore
                id = await DataStore.save(new BadgeProgress({...document}))
            }
        } else {
            id = await DataStore.save(BadgeProgress.copyOf(og, x => {
               keys.forEach(k => {
                //@ts-ignore
                const documentKey = BadgeType[k]
                const selected = documentKey == type
                //@ts-ignore
                x[documentKey] = selected ? (value ? value : ((x[documentKey] || 0) + 1)) : (x[documentKey] || 0)
               })
            }))
        }
        setBadgeProgress(id)
        return id;
    }
    useEffect(() => {
        if (!fetchData) return;
        let subscription: ZenObservable.Subscription | null = null;
        (async() => {
            let og =null// badgeProgress || (await DataStore.query(BadgeProgress, b => b.User.id.eq(userId)))?.[0]
            if (!og) return;
            // subscription = DataStore.observeQuery(Badge, b => b.and(bad => [
            //     bad.numContent.ge(og.numContent), bad.progressCount.ge(og.numProgress), bad.numFollowers.ge(og.numFollowers),
            //     bad.numFoodOrMeals.ge(og.numFoodOrMeals), bad.numReports.ge(og.numReports), bad.numReps.ge(og.numReps),
            //     bad.numRuns.ge(og.numRuns), bad.numWeight.ge(og.numWeight), bad.payouts.ge(og.payouts),
            //     bad.weightDifference.ge(og.weightDifference), bad.bodyFatDifference.ge(og.bodyFatDifference), bad.numTime.ge(og.numTime),
            //     bad.numProgressPhoto.ge(og.numProgressPhotots), bad.numWorkouts.ge(og.numWorkouts)
            // ])).subscribe(ss => {
            //     const {items} = ss;
            //     const missingBadges = items.filter(x => !(badges.findIndex(z => z.id === x.id)===-1))
            //     setNewBadges(missingBadges)
            //     setBadges(items)
            // }) 
        })()
        return () => {
            if (subscription) {
                subscription.unsubscribe()
            }
        }
    }, [])
    return {badges, logProgress, newBadges}
}