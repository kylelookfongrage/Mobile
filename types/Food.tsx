import { Category, MediaType } from "./Media";

export interface FoodProgressProps {
    name: string;
    kcal: number;
    units: string;
    protein: number;
    carbs: number;
    fat: number;
    otherNutrition?: {};
    measures?: { label: string, weight: number }[];
    healthLabels?: string[];
    totalWeight?: number;
    quantity: number;
    img?: MediaType[];
    id: string;
    edamamId?: string;
    src?: 'backend' | 'api'
    category?: "Generic foods" | 'Generic meals' | 'Packaged foods' | 'Fast foods';
    foodContentsLabel?: string;
}[]


export interface MealProgress {
    id: string;
    mealId: string;
    mealName: string;
    img: string;
    totalCalories: number;
    totalFat: number;
    totalProtein: number;
    totalCarbs: number;
    totalWeight: number;
    consumedWeight: number
    // ref?: DocumentReference<DocumentData>,
}

// export const MealProgressConverter: FirestoreDataConverter<MealProgress> = {
//     toFirestore(post: WithFieldValue<MealProgress>): DocumentData {
//         return post;
//     },
//     fromFirestore(
//         snapshot: QueryDocumentSnapshot,
//         options: SnapshotOptions
//     ): MealProgress {
//         const data: DocumentData = snapshot.data(options);
//         //@ts-ignore
//         return { ...data, id: snapshot.id, };
//     },
// };


export interface Meal {
    name: string;
    id: string;
    authorUid: string;
    img: MediaType[];
    description: string;
    steps: string[]
    premium: boolean;
    category?: Category
}

// export const MealConverter: FirestoreDataConverter<Meal> = {
//     toFirestore(post: WithFieldValue<Meal>): DocumentData {
//         return post;
//     },
//     fromFirestore(
//         snapshot: QueryDocumentSnapshot,
//         options: SnapshotOptions
//     ): Meal {
//         const data: DocumentData = snapshot.data(options);
//         //@ts-ignore
//         return { ...data, id: snapshot.id, };
//     },
// };

export interface Ingredient {
    name: string;
    id: string;
    quantity: string;
    units: string;
    img: MediaType[];
    kcal: string;
    fat: string;
    protein: string;
    carbs: string;
}