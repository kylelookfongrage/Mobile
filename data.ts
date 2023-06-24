export interface EdamamParserRequest {
    app_id?: string;
    app_key?: string;
    ingr?: string;
    upc?: string
    nutrition_type?: 'logging' | 'cooking'
}

interface EdamamFood {
    foodId: string;
    label: string;
    image: string;
    knownAs: string;
    foodContentsLabel?: string;
    nutrients: {
        ENERC_KCAL: number;
        PROCNT: number;
        FAT: number;
        CHOCDF: number;
        FIBTG: number
    };
    category: "Generic foods" | 'Generic meals' | 'Packaged foods' | 'Fast foods';
    quantity: number;
    measure: {
        uri: string;
        label: string;
        weight: number
    }
}

export interface EdamamParserResponse {
    text: string;
    error?: string;
    message?: string;
    parsed: {
        food: EdamamFood
    }[];
    hints: {
        food: EdamamFood,
        measures?: {
            uri: string;
            label: string;
            weight: number
        }[]
    }[];
    _links: {
        next: {
            title: string;
            href: string
        }
    }
}

export interface EdamamNutrientsRequest {
    app_id?: string;
    app_key?: string;
    ingredients: {
        quantity: number;
        measureURI: string;
        foodId: string
    }[]
}

interface totalNutrientsType {
    label: string;
    quantity: number;
    unit: string;
}

export interface EdamamNutrientsResponse {
    uri: string;
    calories: number;
    totalWeight: number;
    dietLabels: string[];
    healthLabels: string[];
    cautions: string[];
    totalNutrients: {
        ENERC_KCAL: totalNutrientsType,
        FAT: totalNutrientsType;
        FASAT: totalNutrientsType;
        FATRN: totalNutrientsType;
        FAMS: totalNutrientsType;
        FAPU: totalNutrientsType;
        CHOCDF: totalNutrientsType;
        "CHOCDF.net": totalNutrientsType;
        FIBTG: totalNutrientsType;
        SUGAR: totalNutrientsType;
        PROCNT: totalNutrientsType;
        CHOLE: totalNutrientsType;
        NA: totalNutrientsType;
        CA: totalNutrientsType;
        MG: totalNutrientsType;
        K: totalNutrientsType;
        FE: totalNutrientsType;
        ZN: totalNutrientsType;
        P: totalNutrientsType;
        VITA_RAE: totalNutrientsType;
        VITC: totalNutrientsType;
        THIA: totalNutrientsType;
        RIBF: totalNutrientsType;
        NIA: totalNutrientsType;
        VITB6A: totalNutrientsType;
        FOLDFE: totalNutrientsType;
        FOLFD: totalNutrientsType;
        FOLAC: totalNutrientsType;
        VITB12: totalNutrientsType;
        VITD: totalNutrientsType;
        TOCPHA: totalNutrientsType;
        VITK1: totalNutrientsType;
        WATER: totalNutrientsType;
    };
    totalDaily: {
        ENERC_KCAL: totalNutrientsType,
        FAT: totalNutrientsType;
        FASAT: totalNutrientsType;
        FATRN: totalNutrientsType;
        FAMS: totalNutrientsType;
        FAPU: totalNutrientsType;
        CHOCDF: totalNutrientsType;
        "CHOCDF.net": totalNutrientsType;
        FIBTG: totalNutrientsType;
        SUGAR: totalNutrientsType;
        PROCNT: totalNutrientsType;
        CHOLE: totalNutrientsType;
        NA: totalNutrientsType;
        CA: totalNutrientsType;
        MG: totalNutrientsType;
        K: totalNutrientsType;
        FE: totalNutrientsType;
        ZN: totalNutrientsType;
        P: totalNutrientsType;
        VITA_RAE: totalNutrientsType;
        VITC: totalNutrientsType;
        THIA: totalNutrientsType;
        RIBF: totalNutrientsType;
        NIA: totalNutrientsType;
        VITB6A: totalNutrientsType;
        FOLDFE: totalNutrientsType;
        FOLFD: totalNutrientsType;
        FOLAC: totalNutrientsType;
        VITB12: totalNutrientsType;
        VITD: totalNutrientsType;
        TOCPHA: totalNutrientsType;
        VITK1: totalNutrientsType;
        WATER: totalNutrientsType;
    };
    ingredients: {
        parsed: {
            quantity: number;
            measure: string;
            food: string;
            foodId: string;
            weight: number;
            retainedWeight: number;
            servingsPerContainer: number;
            measureURI: string;
            status: string
        }[]
    }[]

}


export const FetchEdamamParser = async (body: EdamamParserRequest): Promise<EdamamParserResponse> => {
    let url = `https://api.edamam.com/api/food-database/v2/parser?app_id=${body.app_id || Env.EDAMAM_PROJECT_ID || "028e7728"}&app_key=${body.app_key || Env.EDAMAM_API_KEY || "ab2e80c58bdc5491b4c0d34fd7d23d82"}`
    if (body.ingr) { url += `&ingr=${body.ingr}` }
    if (body.upc) { url += `&upc=${body.upc}` }
    if (body.nutrition_type) { url += `&nutrition-type=${body.nutrition_type}` }
    const res: Response = await fetch(encodeURI(url), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }

    })
    const json: EdamamParserResponse = await res.json()
    return json;
}

export const FetchEdamamNutrients = async (body: EdamamNutrientsRequest): Promise<EdamamNutrientsResponse> => {
    let url = `https://api.edamam.com/api/food-database/v2/nutrients?app_id=${body.app_id || Env.EDAMAM_API_KEY || '028e7728'}&app_key=${body.app_key || Env.EDAMAM_API_KEY || "ab2e80c58bdc5491b4c0d34fd7d23d82"}`
    const res = await fetch(url, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ingredients: body.ingredients
        })
    })
    const json: EdamamNutrientsResponse = await res.json()
    return json
}

// 0074305001321
// 0074305001321
interface OpenFoodProduct {
    _id: string;
    _keywords: string[];
    allergens: string;
    brands: string;
    categories: string;
    code: string;
    image_front_url?: string;
    image_url?: string;
    ingredients_text?: string;
    labels?: string[];
    nutriments: {
        "carbohydrates": number,
        "carbohydrates_100g": number,
        "carbohydrates_serving": number,
        "carbohydrates_unit": string,
        "carbohydrates_value": number,
        "energy": number,
        "energy-kcal": number,
        "energy-kcal_100g": number,
        "energy-kcal_serving": number,
        "energy-kcal_unit": "kcal",
        "energy-kcal_value": number,
        "energy-kcal_value_computed": number,
        "energy_100g": number,
        "energy_serving": number,
        "energy_unit": "kcal",
        "energy_value": number,
        "fat": number,
        "fat_100g": number,
        "fat_serving": number,
        "fat_unit": string,
        "fat_value": number,
        "fruits-vegetables-nuts-estimate-from-ingredients_100g": number,
        "fruits-vegetables-nuts-estimate-from-ingredients_serving": number,
        "nutrition-score-fr": number,
        "nutrition-score-fr_100g": number,
        "potassium": number,
        "potassium_100g": number,
        "potassium_serving": number,
        "potassium_unit": string,
        "potassium_value": number,
        "proteins": number,
        "proteins_100g": number,
        "proteins_serving": number,
        "proteins_unit": string,
        "proteins_value": number,
        "salt": number,
        "salt_100g": number,
        "salt_serving": number,
        "salt_unit": string,
        "salt_value": number,
        "saturated-fat": number,
        "saturated-fat_100g": number,
        "saturated-fat_serving": number,
        "saturated-fat_unit": string,
        "saturated-fat_value": number,
        "sodium": number,
        "sodium_100g": number,
        "sodium_serving": number,
        "sodium_unit": string,
        "sodium_value": number,
        "sugars": number,
        "sugars_100g": number,
        "sugars_serving": number,
        "sugars_unit": string,
        "sugars_value": number,
        "trans-fat": number,
        "trans-fat_100g": number,
        "trans-fat_serving": number,
        "trans-fat_unit": string,
        "trans-fat_value": number

    };
    product_name: string;
    product_name_en: string;
    quantity: string;
    serving_quantity: string;
    serving_size: string;
}
interface OpenFoodFactsSearchRepsonse {
    count: number;
    page: number;
    page_count: number;
    page_size: number;
    products: OpenFoodProduct[]

}

export const OpenFoodFactsRequest = async (keyword: string) => {
    const url = `https://us.openfoodfacts.org/cgi/search.pl?action=process&search_terms=${keyword}&sort_by=unique_scans_n&page_size=24?sort_by=popularity&json=1`
    const res = await fetch(url)
    const json: OpenFoodFactsSearchRepsonse = await res.json()
    return json
}


interface OpenFoodFactsBarcodeResponse {
    code: string,
    product: OpenFoodProduct
}

export const OpenFoodFactsBarcodeSearch = async (barcode: string) => {
    const url = `https://us.openfoodfacts.org/api/v2/product/${barcode}`
    const res = await fetch(url)
    const json: OpenFoodFactsBarcodeResponse = await res.json()
    return json
}



import { Storage } from 'aws-amplify';
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { Coordinates } from './aws/models';
import { Env } from './env';
//@ts-ignore
import { Ingredient } from './src/models';
import { MediaType } from './types/Media';

export const uploadImageAndGetID = async (imageSource: MediaType): Promise<string> => {
    if (isStorageUri(imageSource.uri)) {
        return imageSource.uri
    }
    const splits = imageSource.uri.split('.')
    const extension = splits[splits.length - 1]
    const fileName = uuidv4() + '.' + extension
    const req = await fetch(imageSource.uri)
    const blob = await req.blob()
    const storageRes = await Storage.put(fileName, blob)
    return storageRes.key
}



export const uploadMedias = async (imageSources: MediaType[]): Promise<MediaType[]> => {
    let medias: MediaType[] = await Promise.all(imageSources.map(async (x) => {
        if (isStorageUri(x.uri)) {
            return {uri: x.uri, type: x.type}
        } 
        if (x.uri === defaultImage) {
            return {uri: defaultImage, type: 'image'}
        }
        return {uri: await uploadImageAndGetID(x), type: x.type}
      }));
    return medias
}

export const isStorageUri = (id: string): boolean => {
    const re = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}\.[A-Za-z]{3}/
    const re2 = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}\.[A-Za-z]{4}/
    if (id.match(re) !== null || id.match(re2) !== null) return true
    return false
}



export const defaultImage = Env.DEFAULT_IMAGE_URI || 'https://i.ibb.co/mq3pDpG/Icon-Bigicon-Big.png" alt="Icon-Bigicon-Big'

export function toHHMMSS(duration: number) {
    
    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;
  
    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";
    if (hrs > 0) {
      ret += "" + hrs + ":"
    }
    ret += "" + (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
    return ret;
  }
  


export const titleCase = (str: string) => {
    var sentence = str.toLowerCase().split(" ");
    for(var i = 0; i< sentence.length; i++){
       sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    }
    return sentence.join(' ')
}


export const getMatchingNavigationScreen = (key: string, navigator: any): string | null => {
    const routes: string[] = navigator.getState().routeNames
    const i = routes.findIndex(x => x.includes(key))
    if (i !== -1) {
        return routes[i]
    }
    console.log(routes)
    return null
}


//@ts-ignore
export const fractionStrToDecimal = (str: string): number => str.split('/').reduce((p, c) => p / c);


export const getIngredientsAndSteps = (res: string): GenerateMealResult => {
    const splitByIngredientName = res.split('Ingredients:\n')
    const splitStepsString = (splitByIngredientName[1] ? splitByIngredientName[1] : '').includes('Steps') ? 'Steps:' : 'Instructions:'
    const splitBySteps = splitByIngredientName[1] ? splitByIngredientName[1].split(splitStepsString) : [];
    const ingrs = splitBySteps ? splitBySteps[0] : ''
    let ingredients: GenerateIngredientResult[] = []
    let steps: string[] = []
    if (!ingrs) return { ingredients, steps }
    const ingredientsFromSplitBySpaces = ingrs.split('\n')
    ingredientsFromSplitBySpaces.forEach(ingr => {
        let qtyUnitAndFood: string[] = []
        const splitByFirst = ingr.slice(1)
        if (!splitByFirst) return;
        qtyUnitAndFood = splitByFirst.split(' ')
        
        if ([' ', '.', '-'].filter(x => qtyUnitAndFood[0].includes(x)).length > 0) {
            qtyUnitAndFood.shift()
        }
        console.log(qtyUnitAndFood)
        qtyUnitAndFood = qtyUnitAndFood.filter(x => x !== '')
        let qty = null
        let qtyString = qtyUnitAndFood[0]
        if (qtyString.includes('-')) {
            qtyString = qtyString.slice(1)
        }
        if (qtyString.includes('- ')) {
            qtyString = qtyString.slice(2)
        }
        if (qtyString.includes('/')) {
            qty = fractionStrToDecimal(qtyString)
        } else {
            if (Number(qtyString)) {
                qty = Number(qtyString)
            }
        }
        const unit = qtyUnitAndFood.length > 0 ? qtyUnitAndFood[1] : null
        let name = qtyUnitAndFood.length > 1 ? qtyUnitAndFood.slice(2).join(' ') : null
        if (qty && name && unit) {
            if (name.includes('of ')) {
                name = name.split('of ').slice(1).join(' ')
            }
            ingredients.push({ qty, unit, name })
        }
    })
    if (splitBySteps.length > 1) {
        splitBySteps[1].split('\n').forEach(step => {
            if (step === '') return;
            steps.push(step.slice(3))
        })
    }
    return { ingredients, steps }

}


export interface GenerateIngredientResult {
    name: string, qty: number | string, unit: string, ingredient?: string
}


export interface GenerateMealResult {
    ingredients: GenerateIngredientResult[] | null | undefined;
    steps: string[]
}

export const exampleResult = `
Ingredients:

1. 1 scoop vanilla protein powder
2. 1/2 cup of almond milk
3. 1/4 cup of rolled oats
4. 1/4 cup of almond butter
55. 1/4 cup of dark chocolate chips with some pancakes and waffles and something else and something else

Steps:

1. In a medium bowl, mix together the protein powder, almond milk, and rolled oats.

2. Heat the almond butter in a small saucepan over low heat until melted.

3. Add the melted almond butter to the protein powder mixture and stir until combined.

4. Add the dark chocolate chips and stir until combined.

5. Pour the mixture into a greased 8x8 inch baking dish.

6. Bake at 350 degrees Fahrenheit for 20 minutes.

77. Let cool before serving. Enjoy!
`



export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));



function getDistanceBetweenTwoPoints(cord1: Coordinates, cord2: Coordinates) {
    if (cord1.lat == cord2.lat && cord1.long == cord2.long) {
        return 0;
    }

    const radlat1 = (Math.PI * cord1.lat) / 180;
    const radlat2 = (Math.PI * cord2.lat) / 180;

    const theta = cord1.long - cord2.long;
    const radtheta = (Math.PI * theta) / 180;

    let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    if (dist > 1) {
        dist = 1;
    }

    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    // dist = dist * 1.609344; //convert miles to km
    return dist;
}

export function getTotalDistance(coordinates: Coordinates[]) {
    coordinates = coordinates.filter((cord) => {
        if (cord.lat && cord.long) {
            return true;
        }
    });

    let totalDistance = 0;

    if (!coordinates) {
        return 0;
    }

    if (coordinates.length < 2) {
        return 0;
    }

    for (let i = 0; i < coordinates.length - 2; i++) {
        if (
            !coordinates[i].long ||
            !coordinates[i].lat ||
            !coordinates[i + 1].long ||
            !coordinates[i + 1].lat
        ) {
            totalDistance = totalDistance;
        }
        totalDistance =
            totalDistance +
            getDistanceBetweenTwoPoints(coordinates[i], coordinates[i + 1]);
    }

    return totalDistance.toFixed(2);
}


export interface RunType { name: string; emoji: string; }

export const defaultRunTypes: RunType[] = [
    { name: 'Run', emoji: '🏃' },
    { name: 'Walk', emoji: '👟' },
    { name: 'Cycle', emoji: '🚵‍♀️' },
    { name: 'Row', emoji: '🚣‍♀️' },
    { name: 'Surf', emoji: '🏄‍♀️' },
    { name: 'Swim', emoji: '🏊' }
]



export const formatCash = (n:number) => {
    if (n < 1e3) return n;
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
    if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
};


export const substringForLists = (str: string, amt:number=20) => (str.length > amt ? str.substring(0, amt) + '...' : str)
 