import { MediaType } from "./Media";

export interface Exercise {
    media: MediaType[];
    title: string;
    authorUid: string;
    description: string;
    equiptment: {
        name: string;
        img: string;
    }[]
}

export interface Workout {
    name: string;
    id: string;
    img: MediaType[];
    description: string;
    author: string;
    exercises: {
      id: string, name: string, video: string,
      sets: string, reps: string, rest: string, secs: string;
      equiptment: { name: string, img: string }[]
    }[];
  
  }