export interface RunWorkout {
    id: string;
    dateFinished: Date;
    coordinates: number[];
    // ref?: DocumentReference<DocumentData>,
  
  }
  
//   export const RunWorkoutConverter: FirestoreDataConverter<RunWorkout> = {
//     toFirestore(post: WithFieldValue<RunWorkout>): DocumentData {
//       return post;
//     },
//     fromFirestore(
//       snapshot: QueryDocumentSnapshot,
//       options: SnapshotOptions
//     ): RunWorkout {
//       const data: DocumentData = snapshot.data(options);
//       //@ts-ignore
//       return {
//         ...data,
//         id: snapshot.id,
//       };
//     },
//   };
  
  
  
  
  export interface Progress {
    id: string;
    weight: number;
    fat: number;
    picture: string;
  }
  
//   export const ProgressConverter: FirestoreDataConverter<Progress> = {
//     toFirestore(post: WithFieldValue<Progress>): DocumentData {
//       return post;
//     },
//     fromFirestore(
//       snapshot: QueryDocumentSnapshot,
//       options: SnapshotOptions
//     ): Progress {
//       const data: DocumentData = snapshot.data(options);
//       //@ts-ignore
//       return {
//         ...data,
//         id: snapshot.id,
//       };
//     },
//   };