import { Env } from "../env";

let apiKey = Env.FOOD_API_KEY;
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1/'
const FOOD_SEARCH = BASE_URL + 'foods/search?'
const get_food_details_uri = (id: string) => BASE_URL + `food/${id}`;

export const USDABarcodeSearch = async (code: string) => {
    let params = {
        api_key: apiKey,
        query: `gtinUpc:${code}`,
        dataType: 'Branded,Foundation',
        pageSize: '25',
        pageNumber: '1',
    }
    let url = new URL(FOOD_SEARCH)
    url.search = new URLSearchParams(params).toString()
    let result = await fetch(url, {
        headers: {
            'accept': 'application/json'
        }
    })
    let json = await result.json()
    return json as USDASearchResult
}

export const USDAKeywordSearch = async (keyword: string, pageNumber = 1, pageSize = 25, sortBy = 'publishedDate', sortOrder = 'asc'): Promise<USDASearchResult> => {
    let params = {
        api_key: apiKey,
        query: `description:"${keyword}" commonNames:"${keyword}"`,
        dataType: 'Branded,Foundation',
        pageSize: pageSize.toFixed(),
        pageNumber: pageNumber.toFixed(),
        sortBy: sortBy,
        sortOrder: sortOrder
    }
    let url = new URL(FOOD_SEARCH)
    url.search = new URLSearchParams(params).toString()
    let result = await fetch(url, {
        headers: {
            'accept': 'application/json'
        }
    })
    let json = await result.json()
    return json as USDASearchResult
}

export const USDAFoodDetails = async (id: string): Promise<USDABrandedFood | USDAFoundationFoodItem | null> => {
    let url = new URL(get_food_details_uri(id))
    let params = {
        api_key: apiKey
    }
    url.search = new URLSearchParams(params).toString()
    let result = await fetch(url, {
        headers: {
            'accept': 'application/json'
        }
    })
    let json = await result.json()
    return json;
}


type USDASearchType = 'Branded' | 'Foundation' | 'Survey (FNDDS)' | 'SR Legacy';
export interface USDASearchResult {
    totalHits: number,
    currentPage: number;
    totalPages: number;
    pageList: number[];
    foodSearchCriteria: {
        dataType: USDASearchType[];
        query: string;
        generalSearchInput: string;
        pageNumber: number;
        sortBy: string;
        sortOrder: string;
        numberOfResultsPerPage: number;
        pageSize: number;
        requireAllWords: boolean;
        foodTypes: USDASearchType[]
    };
    foods: USDASearchResultFood[]
}

interface USDANutritionType {
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    derivationCode: string;
    derivationDescription: string;
    derivationId: number;
    value: number;
    foodNutrientSourceId: number;
    foodNutrientSourceCode: string;
    foodNutrientSourceDescription: string;
    rank: number;
    indentLevel: number;
    foodNutrientId: number;
    percentDailyValue: number;
}


interface USDAFoodPortion {
    id: number;
    amount: number;
    dataPoints: number;
    gramWeight: number;
    minYearAcquired: number;
    modifier: string;
    portionDescription: string;
    sequenceNumber: number;
    measureUnit: USDAMeasureUnit
}


interface USDAMeasureUnit {
    id: number; abbreviation: string; name: string
}


interface USDASampleFood {
    fdcId: number;
    description: string;
    dataType: USDASearchType;
    foodClass?: string;
    publicationDate: string;
    foodAttributes: USDAFoodCategory[]
}


interface USDAAbridgedFood {
    fdcId: number;
    description: string;
    dataType: USDASearchType;
    foodNutrients: USDANutritionType[]
    publicationDate: string;
    brandOwner?: string;
    gtinUpc?: string;
    ndbNumber?: number;
    foodCode?: string;
}

interface USDASearchResultFood extends USDAAbridgedFood {
    scientificName?: string;
    ingredients?: string;
    additionalDescriptions: string;
    allHighlightFields: string;
    score: number
    commonNames: string;
    foodCategory: string;
    brandName?: string;
}

interface USDABrandedFood extends USDAAbridgedFood {
    availableDate: string;
    brandOwner: string;
    dataSource: string;
    dataType: 'Branded'
    gtinUpc: string;
    householdServingFullText: string;
    ingredients: string;
    modifiedDate: string;
    servingSize: number;
    servingSizeUnit: string;
    preparationStateCode: string;
    brandedFoodCategory: string;
    tradeChannel: string[];
    gpcClassCode: string;
    labelNutrients: USDALabelNutrients
}

interface USDALabelNutrients {
    fat: USDALabelNutrientObject
    saturatedFat: USDALabelNutrientObject
    transFat: USDALabelNutrientObject
    cholesterol: USDALabelNutrientObject
    sodium: USDALabelNutrientObject
    carbohydrates: USDALabelNutrientObject
    fiber: USDALabelNutrientObject
    sugars: USDALabelNutrientObject
    protein: USDALabelNutrientObject
    calcium: USDALabelNutrientObject
    iron: USDALabelNutrientObject
    potassium: USDALabelNutrientObject
    calories: USDALabelNutrientObject
}

interface USDALabelNutrientObject {
    value: number
}

interface USDAFoundationFoodItem extends USDAAbridgedFood {
    dataType: 'Foundation'
    foodClass: string;
    footNote: string;
    isHistoricalReference: boolean;
    scientificName: string;
    foodCategory: USDAFoodCategory;
    foodComponents: USDAFoodComponent[];
    foodPortions: USDAFoodPortion[]
    inputFoods: USDAInputFoodFoundation[];
    nutrientConversionFactors: USDANutrientConversionFactors[]
}


interface USDAInputFoodFoundation {
    id: number; foodDescription: string; inputFood: USDASampleFood
}

interface USDANutrientConversionFactors {
    type: string; value: number;
}


interface USDAFoodCategory {
    id: number; code: string; description: string;
}

interface USDAFoodComponent {
    id: number;
    name: string;
    dataPoints: number;
    gramWeight: number;
    isRefuse: boolean;
    minYearAcquired: number;
    percentWeight: number;
}



export const USDAFoodCategories = {
    'Dairy and Egg Products': '🥛',
    'Spices and Herbs': '🧂',
    'Baby Foods': '🍼',
    'Fats and Oils': '🧈',
    'Poultry Products': '🍗',
    'Soups, Sauces, and Gravies': '🍜',
    'Sausages and Luncheon Meats': '🥓',
    'Breakfast Cereals': '🥣',
    'Fruits and Fruit Juices': '🍊',
    'Pork Products': '🐖',
    'Vegetables and Vegetable Products': '🥦',
    'Nut and Seed Products': '🥜',
    'Beef Products': '🥩',
    'Beverages': '🧃',
    'Finfish and Shellfish Products': '🍤',
    'Legumes and Legume Products': '🫘',
    'Lamb, Veal, and Game Products': '🍖',
    'Baked Products': '🎂',
    'Sweets': '🍰',
    'Cereal Grains and Pasta': '🍝',
    'Fast Foods': '🍟',
    'Meals, Entrees, and Side Dishes': '🌭',
    'Snacks': '🍪',
    'Restaurant Foods': '👩‍🍳',
    'Branded Food Products Database': '🛒',
    'Alcoholic Beverages': '🍷'
}

const ExpandedUSDAFoodCategories = {
    ...USDAFoodCategories,
    'Oriental, Mexican & Ethnic Sauces': "🥫",
    'FAST_FOOD': '🍟',
    'Herbs & Spices': '🧂',
    "Pre-Packaged Fruit & Vegetables": '🍏',
    'Soda': '🥤',
    'Jam, Jelly & Fruit Spreads': '🍯',
    'Pickles, Olives, Peppers & Relishes': "🥒",
    'Water': '💧',
    'Baking Additives & Extracts': '🍦',
    'Seasoning Mixes, Salts, Marinades & Tenderizers': "🧂",
    'Ketchup, Mustard, BBQ & Cheese Sauce': '🥫',
    'Vegetable and Lentil Mixes': '🥗',
    'Cereal': '🥣',
    'Croissants, Sweet Rolls, Muffins & Other Pastries': '🥐',
    'Other Snacks': "🍿",
    'Mexican Dinner Mixes': '🌮',
    'Popcorn, Peanuts, Seeds & Related Snacks': "🍿",
    'Chips, Pretzels & Snacks': "🥨",
    'Canned Meat': '🥓',
    'Other Meats': '🥓',
    'Other Deli': '🥓',
    'Breads & Buns': '🍞',
    'Flours & Corn Meal': '🍞',
    'Ice Cream & Frozen Yogurt': '🍨',
    'Crackers & Biscotti': "🍪",
    'Baking Decorations & Dessert Toppings': "🍨",
    'Rice': '🍚',
    'Pizza Mixes & Other Dry Dinners': '🍕',
    'Entrees, Sides & Small Meals': '🍱',
    'Snack, Energy & Granola Bars': '🍫',
    'Pasta by Shape & Type': '🍝',
    'Prepared Pasta & Pizza Sauces': '🍝',
    'Pasta Dinners': '🍝',
    'Canned Fruit': '🍌',
    'Other Cooking Sauces': "🥫",
    'Liquid Water Enhancer': '💦',
    'Salad Dressing & Mayonnaise': "🧈",
    'Yogurt': '🍦',
    'Confectionery Products': '🍡'
}

export const getEmojiByCategory = (category: string | null | undefined): string => {
    //@ts-ignore
    return ExpandedUSDAFoodCategories[category] || '🍎'
}

let map = new Map()
map.set(208, { name: 'Calories', unit: 'kcal', bolded: true, xl: true, border: 4 })
map.set(204, { name: 'Total Fat', unit: 'g', bolded: true })
map.set(606, { name: 'Saturated Fat', unit: 'g', indented: 1 })
map.set(605, { name: 'Trans Fat', unit: 'g', indented: 1 })
map.set(646, { name: 'Polyunsaturated Fat', unit: 'g', indented: 1 })
map.set(645, { name: 'Monounsaturated Fat', unit: 'g', indented: 1 })
map.set(601, { name: 'Cholesterol', unit: 'mg', bolded: true })
map.set(307, { name: 'Sodium', unit: 'mg', bolded: true })
map.set(205, { name: 'Total Carbohydrate', unit: 'g', bolded: true })
map.set(291, { name: 'Total Fiber', unit: 'g', indented: 1 })
map.set(269, { name: 'Total Sugars', unit: 'g', indented: 1 })
map.set(539, { name: 'Added Sugars', unit: 'g', indented: 2 })
map.set(203, { name: 'Protein', unit: 'g', border: 4, bolded: true })
map.set(382, { name: 'Vitamin D', unit: 'µg' })
map.set(301, { name: 'Calcium', unit: 'mg' })
map.set(303, { name: 'Iron', unit: 'mg' })
map.set(306, { name: 'Potassium', unit: 'mg' })

export const USDAMacroMappingKeys: number[] = [208, 204, 606, 605, 646, 645, 601, 307, 205, 291, 269, 539, 203, 382, 301, 303, 306] 

export const USDAMacroMapping = map;


export const USDANutrientToOtherNutrition = (n: USDANutritionType[]) => {
    console.log(n)
    let calories = 0;
    let fat = 0;
    let protein = 0;
    let carbs = 0;
    let otherNutrition = Object.fromEntries(USDAMacroMappingKeys.map(x => [x, 0]))
    let ignore = [208, 204, 205, 203]
    
    for (var _nutrient of n) {
        //@ts-ignore
        let nutrient = _nutrient.nutrient?.number
        if (!nutrient) return;
        //@ts-ignore
        let amount = _nutrient?.amount || 0
        otherNutrition[`${nutrient}`] = amount
        if (nutrient == 208) {calories = amount}
        if (nutrient == 204) {fat = amount}
        if (nutrient == 205) {carbs = amount}
        if (nutrient == 203) {protein = amount}
    }
    for (var i of ignore) {
        delete otherNutrition[i];
    }
    return {calories, fat, protein, carbs, otherNutrition}
}
