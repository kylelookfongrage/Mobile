
let apiKey = ''

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1/'
const FOOD_SEARCH = BASE_URL + 'foods/search?'
const get_food_details_uri = (id: string) => BASE_URL + `food/${id}`;

export const USDAKeywordSearch = async (keyword: string, pageNumber=1, pageSize=25, sortBy='publishedDate', sortOrder='asc'): Promise<USDASearchResult> => {
    let params = {
        api_key: apiKey,
        query: `description:"${keyword}" commonNames:"${keyword}"`,
        dataType: 'Branded,Foundation',
        pageSize:pageSize.toFixed(),
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

interface USDAFoundationFoodItem extends USDAAbridgedFood{
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

