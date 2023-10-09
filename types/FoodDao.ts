import { Tables, useDao } from "../supabase/dao";
import { useStorage } from "../supabase/storage";

export function FoodDao(){
    const dao = useDao()
    const storage = useStorage()
    const find = async (id: Tables['food']['Row']['id']) => (await dao.find('food', id))
    const save = async (document: Tables['food']['Insert'], uploadImage=true): Promise<Tables['food']['Row'] | null> => {
        let copiedDocument = {...document}
        if (document.image && uploadImage) {
            let attemptedUpload = await storage.upload({type: 'image', uri: document.image})
            copiedDocument['image'] = attemptedUpload?.uri || document['image']
        }
        return await dao.save('food', copiedDocument)
    }

    return {find, save}
}