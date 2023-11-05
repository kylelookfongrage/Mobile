import { isStorageUri } from "../data";
import { PlanAdditions } from "../hooks/useMultipartForm";
import { supabase } from "../supabase";
import { Tables, useDao } from "../supabase/dao";
import { useStorage } from "../supabase/storage";

export function PlanDao(){
    const dao = useDao()
    const storage = useStorage()
    const find = async (id: number) => (await dao.find('fitness_plan', id))
    const save = async (document: Tables['fitness_plan']['Insert']): Promise<Tables['fitness_plan']['Insert'] | null> => {
        let copiedDocument = {...document}
        if (document.image) {
            let attemptedUpload = await storage.upload({type: 'image', uri: document.image, supabaseID: isStorageUri(document.image) ? document.image : undefined})
            console.log(attemptedUpload)
            copiedDocument['image'] = attemptedUpload?.uri || document['image']
        }
        console.log(copiedDocument)
        return document.id ? await dao.update('fitness_plan', document.id, copiedDocument) : await dao.save('fitness_plan', copiedDocument)
    }
    const saveDetails = async (fitness_plan_id: Tables['fitness_plan']['Row']['id'], documents: PlanAdditions[]) => {
        let copy = documents.map(x => {
            let c = {...x, fitness_plan_id: fitness_plan_id} //@ts-ignore
            delete c['image'] //@ts-ignore
            delete c['name']
            delete c['id']
            return c
        })
        let r = await supabase.from('fitness_plan_details').delete().filter('fitness_plan_id', 'eq', fitness_plan_id)
        if (!r.error) {
            let res = await supabase.from('fitness_plan_details').insert(copy).select()
            return res?.data
        }
        return null
    }

    const getDetails = async (id: Tables['fitness_plan']['Row']['id']): Promise<PlanAdditions[] | null> => {
        let d = await supabase.from('fitness_plan_details').select('*, meal(name, preview), workout(name, image)').filter('fitness_plan_id', 'eq', id)
        if (d.data) {
            let res = d.data.map(x => {
                return {...x, name: x.meal?.name || x.workout?.name || '', image: x.meal?.preview || x.workout?.image || ''}
            })
            return res
        }
        return null
    }

    return {find, save, saveDetails, getDetails}
}