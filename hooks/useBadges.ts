import { useEffect, useState } from "react";
import { useSelector } from "../redux/store";

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
    const [badgeProgress, setBadgeProgress] = useState<any | null>(null)
    const [badges, setBadges] = useState<any[]>([])
    const {profile} = useSelector(x => x.auth);
    let userId = profile?.id
    const [newBadges, setNewBadges] = useState<any[]>([])
    async function logProgress(type: BadgeType): Promise<null>{
       return null;
    }
    useEffect(() => {
        
    }, [])
    return {badges, logProgress, newBadges}
}