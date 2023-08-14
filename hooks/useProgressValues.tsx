import { DataStore, Storage } from "aws-amplify";
import React, { useState, useEffect } from "react";
import { Activity, FoodProgress, Goal, Ingredient, Meal, MealProgress, Progress, RunProgress, User, Workout, WorkoutPlay } from "../aws/models";
import { defaultImage, isStorageUri } from "../data";
import { useDateContext } from "../screens/home/Calendar";
import { useCommonAWSIds } from "./useCommonContext";

export interface WorkoutPlayDisplay extends WorkoutPlay {
    picture: string;
    name: string;
    author: string;
}

export interface MealProgressDisplay extends Meal {
    calories: number; fat: number; protein: number; carbs: number, mealProgressID: string;
}


interface useProgressValuesProps {
    metrics?: boolean;
    foodAndMeals?: boolean;
    activitiesAndWorkouts?: boolean
}

export function useProgressValues(props: useProgressValuesProps) {
    const {metrics, activitiesAndWorkouts, foodAndMeals} = props
    const { userId, progressId } = useCommonAWSIds()
    const {AWSDate} = useDateContext()
    const [weight, setWeight] = useState<number>(90)
    const [fat, setFat] = useState<number>(25)
    const [food, setFood] = useState<FoodProgress[]>([])
    const [meals, setMeals] = useState<MealProgressDisplay[]>([])
    const [runs, setRuns] = useState<RunProgress[]>([])
    const [workouts, setWorkouts] = useState<WorkoutPlayDisplay[]>([])
    const [goal, setGoal] = useState<Goal>(Goal.DEFICIT)
    const [water, setWater] = useState<number>(0)
    const [progressPicture, setProgressPicture] = useState<string>()
    const [activities, setActivities] = useState<Activity[]>([])
    const [carbGoal, setCarbGoal] = useState<number>(0)
    const [fatGoal, setFatGoal] = useState<number>(0)
    const [proteinGoal, setProteinGoal] = useState<number>(0)
    const [presetMacros, setPresetMacros] = useState<string | null>(null)
    const [creatorTerms, setCreatorTerms] = useState<boolean>(false)
    const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null)
    const [selectedWorkoutMode, setSelectedWorkoutMode] = useState<string | null>(null);

    useEffect(() => {
        if (!progressId || !metrics) return;
        const subscription = DataStore.observeQuery(Progress, p => p.id.eq(progressId)).subscribe(ss => {
            const {items} = ss;
            if (items[0]) {
                const p = items[0]
                setWater(p.water || 0)
                setProgressPicture(p.picture)
                setFat(p.fat)
                setWeight(p.weight)
                //@ts-ignore
                setActivities(p.activities || [])
            }
        })
        return () => {
            subscription.unsubscribe()
        }
    }, [progressId])

    React.useEffect(() => {
        if (!progressId || !foodAndMeals) return;
        let subscription = DataStore.observeQuery(FoodProgress, f => f.progressID.eq(progressId)).subscribe(ss => {
            const { items } = ss
            Promise.all(items.map(async x => {
                return {...x, img: x.img ? (isStorageUri(x.img) ? await Storage.get(x.img) : x.img) : null}
            })).then(x => setFood(x))
        })
        return () => {
            subscription.unsubscribe()
        }
    }, [progressId])

    React.useEffect(() => {
        if (!metrics || !userId) return;
        DataStore.observeQuery(User, u => u.id.eq(userId)).subscribe(ss => {
            const {items} = ss
            if (items[0]) {
                const user = items[0]
                //@ts-ignore
                setGoal(user.goal)
                setCarbGoal(user.carbGoal || 0)
                setFatGoal(user.fatGoal || 0)
                setProteinGoal(user.proteinGoal || 0)
                setPresetMacros(user.selectedGoal || null)
                setCreatorTerms(user.accepted_content_creator_terms || false)
                setSelectedAnimation(user.selectedSprite || null)
                setSelectedWorkoutMode(user.workoutMode || null)
            }
        })
    }, [])

    React.useEffect(() => {
        if (!progressId || !foodAndMeals) return;
        const subscription = DataStore.observeQuery(MealProgress, mp => mp.progressID.eq(progressId)).subscribe(async ss => {
            const { items } = ss;
            let mealProgresses: MealProgressDisplay[] = []
            await Promise.all(items.map(async mealItem => {
                const meal = await DataStore.query(Meal, mealItem.mealID)
                if (!meal) return;
                const ingredients = await meal.Ingredients.toArray()
                let [calories, carbs, fat, protein] = [0, 0, 0, 0]
                for (var ingredient of ingredients) {
                    calories += (ingredient.kcal || 0) * (mealItem.consumedWeight / (mealItem.totalWeight || 1))
                    carbs += ingredient.carbs * (mealItem.consumedWeight / (mealItem.totalWeight || 1))
                    fat += ingredient.fat * (mealItem.consumedWeight / (mealItem.totalWeight || 1))
                    protein += ingredient.protein * (mealItem.consumedWeight / (mealItem.totalWeight || 1))
                }
                const extendedProps = { carbs, calories, fat, protein, mealProgressID: mealItem.id }
                let preview = meal.preview || defaultImage
                if (isStorageUri(preview)) preview = await Storage.get(preview)
                mealProgresses.push({ ...meal, ...extendedProps, preview: preview })
            }))
            setMeals(mealProgresses)
        })
        return () => subscription.unsubscribe()
    }, [progressId])

    React.useEffect(() => {
        if (!progressId || !activitiesAndWorkouts) return;
        const subscription = DataStore.observeQuery(RunProgress, rp => rp.and(x => [x.userID.eq(userId), x.date.eq(AWSDate)])).subscribe(async ss => {
            const { items } = ss;
            setRuns(items)
        })
        return () => subscription.unsubscribe()
    }, [progressId])

    React.useEffect(() => {
        if (!AWSDate || !activitiesAndWorkouts) return;
        const subscription = DataStore.observeQuery(WorkoutPlay, x => x.and(y => [y.userID.eq(userId), y.date.eq(AWSDate), y.totalTime.gt(0)])).subscribe(ss => {
          const { items } = ss
          if (items.length > 0) {
            Promise.all(items.map(async wo => {
              const defaultWorkout = { ...wo, picture: isStorageUri(defaultImage) ? await Storage.get(defaultImage) : defaultImage }
              if (!wo.workoutID) return defaultWorkout;
              const workoutWithPictureURL = await DataStore.query(Workout, wo.workoutID)
              const userForWorkout = await DataStore.query(User, workoutWithPictureURL?.userID || '')
              if (!workoutWithPictureURL || !userForWorkout || !workoutWithPictureURL.img) {
                return defaultWorkout
              }
              return { ...wo, name: workoutWithPictureURL.name, author: userForWorkout.username, picture: isStorageUri(workoutWithPictureURL.img) ? await Storage.get(workoutWithPictureURL.img) : workoutWithPictureURL.img }
              //@ts-ignore
            })).then(setWorkouts)
          } else {
            setWorkouts(items.map(x => ({ ...x, picture: defaultImage, name: 'Cannot find workout', author: 'Unknnown' })))
          }
        })
        return () => subscription.unsubscribe()
      }, [AWSDate])

      return { weight, fat, food, meals, runs, selectedWorkoutMode, workouts, goal, water, progressPicture, activities, carbGoal, proteinGoal, fatGoal, presetMacros, creatorTerms, selectedAnimation  }
}