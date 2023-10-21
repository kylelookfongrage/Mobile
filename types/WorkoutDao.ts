import { WorkoutAdditions } from "../hooks/useMultipartForm";
import { supabase } from "../supabase";
import { Tables, useDao } from "../supabase/dao";
import { useStorage } from "../supabase/storage";

export function WorkoutDao(){
    const dao = useDao()
    const storage = useStorage()
    const find = async (id: Tables['workout']['Row']['id']) => (await dao.find('workout', id))
    type TWorkoutDetails = Tables['workout_details']['Row'] & {
        exercise: Tables['exercise']['Row'] & {
            exercise_equiptment: {
                equiptment: Tables['equiptment']['Row']
            }[]
        }
    }
    const find_eqipment = async (id: Tables['exercise']['Row']['id']): Promise<TWorkoutDetails[]> => {
        let res = await supabase.from('workout_details').select(`
            *, exercise(*, exercise_equiptment(
                equiptment(*)
            ))
        `).filter('workout_id', 'eq', id)
        return res?.data || []
    }
    const search = async (options: { keyword?: string | null; belongsTo?: string; favorited?: boolean; selectString?: string; user_id?: string }): Promise<Tables['workout']['Row'][] | null> => {
        let { keyword, belongsTo, favorited, selectString, user_id } = options
        let str = selectString
        if (favorited && user_id) {
            str = str + ", favorites!inner(user_id)"
        }
        console.log(str)
        let q = supabase.from('workout').select(str || '*')
        if (keyword) q = q.filter('name', 'ilike', `%${keyword}%`)
        if (belongsTo) q = q.filter('user_id', 'eq', belongsTo)
        if (favorited && user_id) q = q.filter('favorites.user_id', 'eq', user_id)
        let data = await q.range(0, 50)
        console.log(data)
        //@ts-ignore
        return data?.data || null
    }
    const save = async (workout: Tables['workout']['Insert']): Promise<Tables['workout']['Insert'] | null> => {
        let copiedDocument = {...workout}
        if (workout.image) {
            let attemptedUpload = await storage.upload({type: 'image', uri: workout.image})
            copiedDocument['image'] = attemptedUpload?.uri || workout['image']
        }
        let res = workout.id ? await dao.update('workout', workout.id, copiedDocument) : await dao.save('workout', copiedDocument)
        return res;
    }

    const saveWorkoutDetails = async (id: Tables['workout']['Row']['id'], details: WorkoutAdditions[]) => {
        await supabase.from('workout_details').delete().filter('workout_id', 'eq', id)
        let ingrs: Tables['workout_details']['Insert'][] = []
        for (var d of details) {
            let copy = {...d} //@ts-ignore
            delete copy['equiptment']  //@ts-ignore
            delete copy['img'] //@ts-ignore
            delete copy['name'] //@ts-ignore
            copy['exercise_id'] = copy['tempId']
            delete copy['tempId']
            copy['workout_id'] = id
            ingrs.push(copy)
        }
        console.log(ingrs)
        return await supabase.from('workout_details').insert(ingrs).select()
    }

    const find_workout_play = async (id: Tables['workout_play']['Row']['id']): Promise<[Tables['workout_play']['Row'] | null, Tables['workout_play_details']['Row'][] | null]> => {
        let res = await supabase.from('workout_play').select('*').filter('id', 'eq', id).maybeSingle()
        let workoutPlay = res.data || null
        let r2 = await supabase.from('workout_play_details').select('*').filter('workout_play_id', 'eq', id)
        let details = (r2?.data) || null
        return [workoutPlay, details]
    }

    type TWorkoutDetailWithExercise = Tables['workout_details']['Row'] & {exercise: Tables['exercise']['Row'] | null}
    type TWorkoutWithDetails = Tables['workout']['Row'] & {workout_details: TWorkoutDetailWithExercise[]}
    const find_workout_with_details = async (id: Tables['workout']['Row']['id']): Promise<TWorkoutWithDetails> => {
        let res = await supabase.from('workout').select('*, workout_details(*, exercise(*))').filter('id', 'eq', id).maybeSingle()
        return (res.data) || null
    }

    const find_exercises = async (id: Tables['workout']['Row']['id']): Promise<Tables['exercise']['Row'] | null> => {
        let res = await supabase.from('workout_details').select('exercise(*)').filter('workout_id', 'eq', id)
        //@ts-ignore
        return res.data?.flatMap(x => x.exercise) || null
    }

    const completeWorkout = async (workoutPlay: Tables['workout_play']['Insert'], workoutPlayDetails: Tables['workout_play_details']['Insert'][]) => {
        let res = workoutPlay.id ? await dao.update('workout_play', workoutPlay.id, workoutPlay) : await dao.save('workout_play', workoutPlay)
        if (res && res.id) {
            await supabase.from('workout_play_details').upsert(workoutPlayDetails.map(x => ({...x, workout_play_id: res?.id})))
        }
        return res;
    }

    const remove = async (id: Tables['workout']['Row']['id']) => {await dao.remove('workout', id)}

    return {find, save, search, saveWorkoutDetails, find_eqipment, find_workout_play, find_workout_with_details, find_exercises, completeWorkout, remove}
}

export interface WorkoutPlayDisplayProps {
    currentExercise: Tables['exercise']['Row'];
    exercises: Tables['exercise']['Row'][];
    shouldShowMore: boolean;
    setShouldShowMore: React.Dispatch<React.SetStateAction<boolean>>;
    selectedWorkoutDetail: Tables['workout_details']['Row'];
    setSelectedWorkoutDetail: React.Dispatch<React.SetStateAction<Tables['workout_details']['Row'] | undefined>>;
    paused: boolean;
    setPaused: React.Dispatch<React.SetStateAction<boolean>>;
    totalTime: number;
    onResetPress: () => void;
    workoutPlayDetails: Tables['workout_play_details']['Insert'][];
    onNewSetPress: () => void;
    onFinishPress: () => void;
    animation: any;
    workoutDetails: Tables['workout_details']['Row'][];
    selectedWorkoutPlayDetail: Tables['workout_play_details']['Insert'] | undefined;
    setSelectedWorkoutPlayDetail: React.Dispatch<React.SetStateAction<Tables['workout_play_details']['Insert'] | undefined>>;
    forwardBackwardPress: (b?: boolean) => void;
}