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
    let url = `https://api.edamam.com/api/food-database/v2/nutrients?app_id=${body.app_id || Env.EDAMAM_PROJECT_ID || '028e7728'}&app_key=${body.app_key || Env.EDAMAM_API_KEY || "ab2e80c58bdc5491b4c0d34fd7d23d82"}`
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
            return { uri: x.uri, type: x.type }
        }
        if (x.uri === defaultImage) {
            return { uri: defaultImage, type: 'image' }
        }
        return { uri: await uploadImageAndGetID(x), type: x.type }
    }));
    return medias
}

export const isStorageUri = (id: string): boolean => {
    if (!id || typeof id !== 'string') return false;
    const re = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}\.[A-Za-z]{3}/
    const re2 = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}\.[A-Za-z]{4}/
    if (id?.match(re) !== null || id?.match(re2) !== null) return true
    return false
}



export const defaultImage = Env.DEFAULT_IMAGE_URI || 'https://i.ibb.co/mq3pDpG/Icon-Bigicon-Big.png" alt="Icon-Bigicon-Big'

export function toHHMMSS(duration: number, seperator: string = ':') {

    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";
    if (hrs > 0) {
        ret += "" + hrs + seperator
    }
    ret += "" + (mins < 10 ? "0" : "") + mins + seperator + (secs < 10 ? "0" : "") + secs;
    return ret;
}



export const titleCase = (str: string) => {
    var sentence = str.toLowerCase().split(" ");
    for (var i = 0; i < sentence.length; i++) {
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
export const fractionStrToDecimal = (str: string, places = 2): number => Number(Number(str.split('/').reduce((p, c) => p / c)).toFixed(places));


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



export const formatCash = (n: number) => {
    if (n < 1e3) return n;
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
    if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
};


export const substringForLists = (str: string, amt: number = 20) => (str.length > amt ? str.substring(0, amt) + '...' : str)



import timer from './assets/animations/timer.json'
import meditation from './assets/animations/meditation.json'
import pigeon_wait from './assets/animations/pigeon_wait.json'
import sloth_sleep from './assets/animations/sloth_sleep.json'
import sloth_sleeping from './assets/animations/sloth_sleeping.json'
import bear_sleep from './assets/animations/bear_sleep.json'
import sleepy_sleep from './assets/animations/sleepy_sleep.json'
import squirrel_sleep from './assets/animations/squirrel-sleeping.json'

export const animationMapping = [
    { name: 'Up Next Video', animation: null},
    { name: 'Dog Run', animation: timer },
    { name: 'Squirrel Sleep', animation: squirrel_sleep },
    { name: 'Pigeon Wait', animation: pigeon_wait },
    { name: 'Sloth Sleep', animation: sloth_sleep },
    { name: 'Sloth Sleep (2)', animation: sloth_sleeping },
    { name: 'Bear Sleep', animation: bear_sleep },
    { name: 'Meditation', animation: meditation },
    { name: 'Moon Sleep', animation: sleepy_sleep },
]



export enum postMediaType {
    none, media, meal = 'meal', workout = 'workout', exercise = 'exercise', run = 'run'
}


export interface PostMediaSearchDisplay {
    id: any;
    name?: string;
    img?: string;
    author?: string;
    coordinates?: string;
    time?: number;
}




export interface ChartMapping { date: string; reps: number; weight: number; secs: number; metric?: boolean; };

export function getFormattedDate(date: Date) {

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return month + '/' + day
}

export interface ExerciseDisplay {
    video: string;
    name: string;
    id: string;
    description: string;
    preview: string;
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



export enum WorkoutMode {
    default = 'DEFAULT',
    player = 'MUSIC'
}





export function calculateBodyFat(sex: 'male' | 'female', unit: 'USC' | 'Metric', waist: number, neck: number, height: number, hip?: number): number {
    const logWaistNeck = Math.log10(waist - neck);
    const logHeight = Math.log10(height);

    let bfp: number;

    if (unit === 'USC') {
        if (sex === 'female' && typeof hip !== 'number') {
            throw new Error('Hip measurement is required for females in USC units.');
        }
        const logWaistHipNeck = Math.log10(waist + (hip || 0) - neck);

        if (height <= 0 || waist <= 0 || neck <= 0 || (hip !== undefined && hip <= 0)) {
            throw new Error('All measurements must be positive numbers.');
        }

        if (sex === 'male') {
            bfp = 86.010 * logWaistNeck - 70.041 * logHeight + 36.76;
        } else {
            if (waist + (hip || 0) - neck <= 0) {
                throw new Error('Invalid measurements: waist + hip - neck must be greater than zero for females in USC units.');
            }
            bfp = 163.205 * logWaistHipNeck - 97.684 * logHeight - 78.387;
        }
    } else if (unit === 'Metric') {
        if (height <= 0 || waist <= 0 || neck <= 0) {
            throw new Error('All measurements must be positive numbers.');
        }

        if (sex === 'male') {
            bfp = 495 / (1.0324 - 0.19077 * logWaistNeck + 0.15456 * logHeight) - 450;
        } else {
            bfp = 495 / (1.29579 - 0.35004 * logWaistNeck + 0.22100 * logHeight) - 450;
        }
    } else {
        throw new Error('Invalid unit. Please use either "USC" or "Metric".');
    }

    return bfp;
}


export const usernameRegex = /^(?=[a-zA-Z0-9._]{4,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/


export const inchesToFeet = (_inches: number, min = -1000): string => {
    let inches = _inches < min ? min : _inches
    const remainderInches = Math.round(inches % 12)
    const totalFeet = Math.round((inches - remainderInches) / 12)
    return `${totalFeet} ft ${remainderInches} in`
}



import moment from 'moment';
import { IngredientAdditions } from './hooks/useMultipartForm';
import { Tables } from './supabase/dao';

function calculateTDEE(male: boolean, weight: number, height: number, age: number, activity: 'sedentary' | 'light' | 'average' | 'active', metric: boolean = false): number {
    const heightMultiplier = metric ? 1 : 2.54; // Convert inches to cm if not using metric units
    const weightMultiplier = metric ? 1 : 0.453592; // Convert pounds to kg if not using metric units

    const heightInCm = height * heightMultiplier;
    const weightInKg = weight * weightMultiplier;

    const bmr = male
        ? 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5
        : 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161;

    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        average: 1.55,
        active: 1.725,
    };

    const tdee = bmr * activityMultipliers[activity];
    return tdee;
}

export function caloriesPerDay(
    male: boolean,
    dateOfBirth: string,
    startDate: string,
    endDate: string,
    startWeight: number,
    endWeight: number,
    height: number,
    bodyFat: number,
    activity: 'sedentary' | 'light' | 'average' | 'active',
    metric: boolean = false
): number {
    const daysDifference = moment(endDate, 'YYYY-MM-DD').diff(moment(startDate, 'YYYY-MM-DD'), 'days');
    const weightChange = startWeight - endWeight; // Positive for weight gain, negative for weight loss

    const caloriesPerUnitChange = metric ? 7700 : 3500; // 7700 calories per kg (metric) or 3500 calories per pound (imperial)

    const totalCaloriesNeeded = caloriesPerUnitChange * weightChange;

    const age = moment().diff(moment(dateOfBirth, 'YYYY-MM-DD'), 'years');
    const tdee = calculateTDEE(male, startWeight, height, age, activity, metric);

    const leanMass = startWeight * (1 - bodyFat / 100);
    const adjustedTDEE = tdee + (leanMass - startWeight) * 20;

    const dailyCalories = (totalCaloriesNeeded / daysDifference) + adjustedTDEE;

    return dailyCalories < 1400 ? 1400 : dailyCalories;
}


export interface MediaType {
    uri: string;
    type: string;
    supabaseID?: string;
    metadata?: any;
}


interface ValidationObject {
    name: string;
    value: any,
    options: {
        required?: boolean;
        validate?: (v: ValidationObject['value']) => boolean;
        errorMessage?: string;
        contains?: {
            text: string;
            alias?: string;
        };
        cannotContain?: {
            text: string;
            alias?: string;
        }
    }
}
export const validate = function (textFieldValuesAndOptions: ValidationObject[]) {
    /* 
      validate: Will validate the text field based on the options provided
      params: {
        textFieldValuesAndOptions: a JSON object with the values and their respective requirements
      }
      returns: either true or a JSON object with keys of error responses
    */
    const errors: string[] = [];
    textFieldValuesAndOptions.forEach((k) => {
        const textField = k;
        const name = textField.name;
        const value = textField.value;
        const options = textField.options;

        //these are available options for each {required, contains, cannotContain}
        if (options.required) {
            const requriedErrorMessage = `${name} is required`;
            if (value === null || value === undefined || value == '' || value.length === 0) {
                errors.push(requriedErrorMessage);
            }
        }

        //these are available options for each {required, contains: {text}, cannotContain: {text}}
        if (options.contains) {
            const containsRequirement = options.contains.text;
            const alias = options.contains.alias
            const requriedErrorMessage = `${name} must contain ${alias || containsRequirement}`;
            if (!value.includes(containsRequirement))
                errors.push(requriedErrorMessage);
        }

        //these are available options for each {required, contains: {text}, cannotContain: {text}}
        if (options.cannotContain) {
            const cannotContainsRequirement = options.cannotContain.text;
            const requriedErrorMessage = `${name} must NOT contain ${cannotContainsRequirement}`;
            if (value.includes(cannotContainsRequirement))
                errors.push(requriedErrorMessage);
        }

        if (options.validate) {
            let validationInput = options.validate(value)
            if (!validationInput) {
                errors.push(options.errorMessage || 'Something went wrong')
            }
        }


    });

    if (Object.keys(errors).length === 0) {
        return true;
    } else {
        return errors;
    }
};




export const getMacrosFromIngredients = (ingrs: IngredientAdditions[]): { protein: number, carbs: number; calories: number; fat: number, otherNutrition: { [k: string]: { value: number; } } } => {
    let protein: number = 0;
    let calories: number = 0;
    var carbs: number = 0;
    var fat: number = 0;
    let otherNutrition: { [k: string]: { value: number } } = {}
    ingrs.forEach((i) => {
        calories += Number(i.calories)
        protein += Number(i.protein)
        carbs += Number(i.carbs)
        fat += Number(i.fat)
        try {
            if (i.otherNutrition) {
                Object.keys(i.otherNutrition).forEach(k => {
                    const potential = otherNutrition[k]?.['value']
                    //@ts-ignore
                    const value = i.otherNutrition[k]
                    if (value.hidden) return;
                    if (potential) {
                        otherNutrition[k]['value'] = (potential || 0) + (Number(value.value) || 0)
                    } else {
                        otherNutrition[k] = {
                            value: (Number(value.value) || 0)
                        }
                    }
                })
            }
        } catch (error) {
            console.log(error)
        }
    })
    return { protein, carbs, calories, fat, otherNutrition }

}



export function pad(pad: string, str: string, padLeft = false): string {
    if (typeof str === 'undefined')
        return pad;
    if (padLeft) {
        return (pad + str).slice(-pad.length);
    } else {
        return (str + pad).substring(0, pad.length);
    }
}


export function findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
    let l = array.length;
    while (l--) {
        if (predicate(array[l], l, array))
            return l;
    }
    return -1;
}


type RepeatFrequencies = 'DAILY' | 'MONTHLY' | 'BI-MONTHLY' | 'WEEKLY' | 'BI-WEEKLY' | 'ANNUALLY' | undefined | null


export const ConversionChart = {
    'Gram' : {value: 1, aliases: ['g', 'grams']},
    'Milliliter': {value: 1, aliases: ['ml', 'mil', 'mi', 'milliliters']},
    'Ounce': {value: 28.3495, aliases: ['oz', 'ounces']},
    'Tablespoon (liquid)': {value: 15, aliases: []},
    'Tablespoon': {value: 14.175, aliases: ['tbsp', 'tablespoons']},
    'Teaspoon (liquid)': {value: 5, aliases: []},
    'Teaspoon': {value: 4.725, aliases: ['tsp', 'teaspoons']},
    'Fluid Ounce': {value: 29.5735, aliases: ['fl oz', 'floz', 'fluid ounces']},
    'Pound': {value: 453.592, aliases: ['lb', 'lbs', 'pounds']},
    'Cup (liquid)':  {value: 236.588, aliases: []},
    'Cup': {value: 250, aliases: ['cups']},
    'Gallon': {value: 3785.41, aliases: ['gallons']},
    'Quart': {value: 946.353, aliases: ['q', 'quarts']},
    'Pint': {value: 568.261, aliases: ['p', 'pints']}
}