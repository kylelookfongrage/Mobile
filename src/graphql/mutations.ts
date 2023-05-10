/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createWorkoutDetailModifier = /* GraphQL */ `
  mutation CreateWorkoutDetailModifier(
    $input: CreateWorkoutDetailModifierInput!
    $condition: ModelWorkoutDetailModifierConditionInput
  ) {
    createWorkoutDetailModifier(input: $input, condition: $condition) {
      id
      userID
      rounds
      exercisesPerRound
      restAfterRound
      timePerExercise
      setsPerExercise
      name
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateWorkoutDetailModifier = /* GraphQL */ `
  mutation UpdateWorkoutDetailModifier(
    $input: UpdateWorkoutDetailModifierInput!
    $condition: ModelWorkoutDetailModifierConditionInput
  ) {
    updateWorkoutDetailModifier(input: $input, condition: $condition) {
      id
      userID
      rounds
      exercisesPerRound
      restAfterRound
      timePerExercise
      setsPerExercise
      name
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteWorkoutDetailModifier = /* GraphQL */ `
  mutation DeleteWorkoutDetailModifier(
    $input: DeleteWorkoutDetailModifierInput!
    $condition: ModelWorkoutDetailModifierConditionInput
  ) {
    deleteWorkoutDetailModifier(input: $input, condition: $condition) {
      id
      userID
      rounds
      exercisesPerRound
      restAfterRound
      timePerExercise
      setsPerExercise
      name
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createPantryItem = /* GraphQL */ `
  mutation CreatePantryItem(
    $input: CreatePantryItemInput!
    $condition: ModelPantryItemConditionInput
  ) {
    createPantryItem(input: $input, condition: $condition) {
      id
      purchased
      ingredientID
      userID
      inCart
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updatePantryItem = /* GraphQL */ `
  mutation UpdatePantryItem(
    $input: UpdatePantryItemInput!
    $condition: ModelPantryItemConditionInput
  ) {
    updatePantryItem(input: $input, condition: $condition) {
      id
      purchased
      ingredientID
      userID
      inCart
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deletePantryItem = /* GraphQL */ `
  mutation DeletePantryItem(
    $input: DeletePantryItemInput!
    $condition: ModelPantryItemConditionInput
  ) {
    deletePantryItem(input: $input, condition: $condition) {
      id
      purchased
      ingredientID
      userID
      inCart
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createApplication = /* GraphQL */ `
  mutation CreateApplication(
    $input: CreateApplicationInput!
    $condition: ModelApplicationConditionInput
  ) {
    createApplication(input: $input, condition: $condition) {
      id
      isDeleted
      approved
      stripeID
      userID
      workoutID
      mealID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateApplication = /* GraphQL */ `
  mutation UpdateApplication(
    $input: UpdateApplicationInput!
    $condition: ModelApplicationConditionInput
  ) {
    updateApplication(input: $input, condition: $condition) {
      id
      isDeleted
      approved
      stripeID
      userID
      workoutID
      mealID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteApplication = /* GraphQL */ `
  mutation DeleteApplication(
    $input: DeleteApplicationInput!
    $condition: ModelApplicationConditionInput
  ) {
    deleteApplication(input: $input, condition: $condition) {
      id
      isDeleted
      approved
      stripeID
      userID
      workoutID
      mealID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createFollower = /* GraphQL */ `
  mutation CreateFollower(
    $input: CreateFollowerInput!
    $condition: ModelFollowerConditionInput
  ) {
    createFollower(input: $input, condition: $condition) {
      id
      subscribedFrom
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateFollower = /* GraphQL */ `
  mutation UpdateFollower(
    $input: UpdateFollowerInput!
    $condition: ModelFollowerConditionInput
  ) {
    updateFollower(input: $input, condition: $condition) {
      id
      subscribedFrom
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteFollower = /* GraphQL */ `
  mutation DeleteFollower(
    $input: DeleteFollowerInput!
    $condition: ModelFollowerConditionInput
  ) {
    deleteFollower(input: $input, condition: $condition) {
      id
      subscribedFrom
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createFavorite = /* GraphQL */ `
  mutation CreateFavorite(
    $input: CreateFavoriteInput!
    $condition: ModelFavoriteConditionInput
  ) {
    createFavorite(input: $input, condition: $condition) {
      id
      potentialID
      userID
      type
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateFavorite = /* GraphQL */ `
  mutation UpdateFavorite(
    $input: UpdateFavoriteInput!
    $condition: ModelFavoriteConditionInput
  ) {
    updateFavorite(input: $input, condition: $condition) {
      id
      potentialID
      userID
      type
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteFavorite = /* GraphQL */ `
  mutation DeleteFavorite(
    $input: DeleteFavoriteInput!
    $condition: ModelFavoriteConditionInput
  ) {
    deleteFavorite(input: $input, condition: $condition) {
      id
      potentialID
      userID
      type
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createExerciseEquiptmentDetail = /* GraphQL */ `
  mutation CreateExerciseEquiptmentDetail(
    $input: CreateExerciseEquiptmentDetailInput!
    $condition: ModelExerciseEquiptmentDetailConditionInput
  ) {
    createExerciseEquiptmentDetail(input: $input, condition: $condition) {
      id
      exerciseID
      equiptmentID
      sub
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateExerciseEquiptmentDetail = /* GraphQL */ `
  mutation UpdateExerciseEquiptmentDetail(
    $input: UpdateExerciseEquiptmentDetailInput!
    $condition: ModelExerciseEquiptmentDetailConditionInput
  ) {
    updateExerciseEquiptmentDetail(input: $input, condition: $condition) {
      id
      exerciseID
      equiptmentID
      sub
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteExerciseEquiptmentDetail = /* GraphQL */ `
  mutation DeleteExerciseEquiptmentDetail(
    $input: DeleteExerciseEquiptmentDetailInput!
    $condition: ModelExerciseEquiptmentDetailConditionInput
  ) {
    deleteExerciseEquiptmentDetail(input: $input, condition: $condition) {
      id
      exerciseID
      equiptmentID
      sub
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createWorkoutPlayDetail = /* GraphQL */ `
  mutation CreateWorkoutPlayDetail(
    $input: CreateWorkoutPlayDetailInput!
    $condition: ModelWorkoutPlayDetailConditionInput
  ) {
    createWorkoutPlayDetail(input: $input, condition: $condition) {
      id
      reps
      rest
      weight
      secs
      completed
      workoutplayID
      workoutID
      exerciseID
      userID
      workoutdetailsID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateWorkoutPlayDetail = /* GraphQL */ `
  mutation UpdateWorkoutPlayDetail(
    $input: UpdateWorkoutPlayDetailInput!
    $condition: ModelWorkoutPlayDetailConditionInput
  ) {
    updateWorkoutPlayDetail(input: $input, condition: $condition) {
      id
      reps
      rest
      weight
      secs
      completed
      workoutplayID
      workoutID
      exerciseID
      userID
      workoutdetailsID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteWorkoutPlayDetail = /* GraphQL */ `
  mutation DeleteWorkoutPlayDetail(
    $input: DeleteWorkoutPlayDetailInput!
    $condition: ModelWorkoutPlayDetailConditionInput
  ) {
    deleteWorkoutPlayDetail(input: $input, condition: $condition) {
      id
      reps
      rest
      weight
      secs
      completed
      workoutplayID
      workoutID
      exerciseID
      userID
      workoutdetailsID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createWorkoutPlay = /* GraphQL */ `
  mutation CreateWorkoutPlay(
    $input: CreateWorkoutPlayInput!
    $condition: ModelWorkoutPlayConditionInput
  ) {
    createWorkoutPlay(input: $input, condition: $condition) {
      id
      sub
      totalTime
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateWorkoutPlay = /* GraphQL */ `
  mutation UpdateWorkoutPlay(
    $input: UpdateWorkoutPlayInput!
    $condition: ModelWorkoutPlayConditionInput
  ) {
    updateWorkoutPlay(input: $input, condition: $condition) {
      id
      sub
      totalTime
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteWorkoutPlay = /* GraphQL */ `
  mutation DeleteWorkoutPlay(
    $input: DeleteWorkoutPlayInput!
    $condition: ModelWorkoutPlayConditionInput
  ) {
    deleteWorkoutPlay(input: $input, condition: $condition) {
      id
      sub
      totalTime
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createWorkoutDetails = /* GraphQL */ `
  mutation CreateWorkoutDetails(
    $input: CreateWorkoutDetailsInput!
    $condition: ModelWorkoutDetailsConditionInput
  ) {
    createWorkoutDetails(input: $input, condition: $condition) {
      id
      sets
      reps
      secs
      rest
      workoutID
      exerciseID
      userID
      note
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateWorkoutDetails = /* GraphQL */ `
  mutation UpdateWorkoutDetails(
    $input: UpdateWorkoutDetailsInput!
    $condition: ModelWorkoutDetailsConditionInput
  ) {
    updateWorkoutDetails(input: $input, condition: $condition) {
      id
      sets
      reps
      secs
      rest
      workoutID
      exerciseID
      userID
      note
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteWorkoutDetails = /* GraphQL */ `
  mutation DeleteWorkoutDetails(
    $input: DeleteWorkoutDetailsInput!
    $condition: ModelWorkoutDetailsConditionInput
  ) {
    deleteWorkoutDetails(input: $input, condition: $condition) {
      id
      sets
      reps
      secs
      rest
      workoutID
      exerciseID
      userID
      note
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createWorkout = /* GraphQL */ `
  mutation CreateWorkout(
    $input: CreateWorkoutInput!
    $condition: ModelWorkoutConditionInput
  ) {
    createWorkout(input: $input, condition: $condition) {
      id
      name
      description
      img
      sub
      premium
      WorkoutDetails {
        items {
          id
          sets
          reps
          secs
          rest
          workoutID
          exerciseID
          userID
          note
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      category
      userID
      Applications {
        items {
          id
          isDeleted
          approved
          stripeID
          userID
          workoutID
          mealID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateWorkout = /* GraphQL */ `
  mutation UpdateWorkout(
    $input: UpdateWorkoutInput!
    $condition: ModelWorkoutConditionInput
  ) {
    updateWorkout(input: $input, condition: $condition) {
      id
      name
      description
      img
      sub
      premium
      WorkoutDetails {
        items {
          id
          sets
          reps
          secs
          rest
          workoutID
          exerciseID
          userID
          note
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      category
      userID
      Applications {
        items {
          id
          isDeleted
          approved
          stripeID
          userID
          workoutID
          mealID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteWorkout = /* GraphQL */ `
  mutation DeleteWorkout(
    $input: DeleteWorkoutInput!
    $condition: ModelWorkoutConditionInput
  ) {
    deleteWorkout(input: $input, condition: $condition) {
      id
      name
      description
      img
      sub
      premium
      WorkoutDetails {
        items {
          id
          sets
          reps
          secs
          rest
          workoutID
          exerciseID
          userID
          note
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      category
      userID
      Applications {
        items {
          id
          isDeleted
          approved
          stripeID
          userID
          workoutID
          mealID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createExercise = /* GraphQL */ `
  mutation CreateExercise(
    $input: CreateExerciseInput!
    $condition: ModelExerciseConditionInput
  ) {
    createExercise(input: $input, condition: $condition) {
      id
      title
      description
      userID
      media {
        uri
        type
        awsID
      }
      sub
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutDetails {
        items {
          id
          sets
          reps
          secs
          rest
          workoutID
          exerciseID
          userID
          note
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      ExerciseEquiptmentDetails {
        items {
          id
          exerciseID
          equiptmentID
          sub
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateExercise = /* GraphQL */ `
  mutation UpdateExercise(
    $input: UpdateExerciseInput!
    $condition: ModelExerciseConditionInput
  ) {
    updateExercise(input: $input, condition: $condition) {
      id
      title
      description
      userID
      media {
        uri
        type
        awsID
      }
      sub
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutDetails {
        items {
          id
          sets
          reps
          secs
          rest
          workoutID
          exerciseID
          userID
          note
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      ExerciseEquiptmentDetails {
        items {
          id
          exerciseID
          equiptmentID
          sub
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteExercise = /* GraphQL */ `
  mutation DeleteExercise(
    $input: DeleteExerciseInput!
    $condition: ModelExerciseConditionInput
  ) {
    deleteExercise(input: $input, condition: $condition) {
      id
      title
      description
      userID
      media {
        uri
        type
        awsID
      }
      sub
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutDetails {
        items {
          id
          sets
          reps
          secs
          rest
          workoutID
          exerciseID
          userID
          note
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      ExerciseEquiptmentDetails {
        items {
          id
          exerciseID
          equiptmentID
          sub
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createEquiptment = /* GraphQL */ `
  mutation CreateEquiptment(
    $input: CreateEquiptmentInput!
    $condition: ModelEquiptmentConditionInput
  ) {
    createEquiptment(input: $input, condition: $condition) {
      id
      name
      img
      userID
      sub
      ExerciseEquiptmentDetails {
        items {
          id
          exerciseID
          equiptmentID
          sub
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateEquiptment = /* GraphQL */ `
  mutation UpdateEquiptment(
    $input: UpdateEquiptmentInput!
    $condition: ModelEquiptmentConditionInput
  ) {
    updateEquiptment(input: $input, condition: $condition) {
      id
      name
      img
      userID
      sub
      ExerciseEquiptmentDetails {
        items {
          id
          exerciseID
          equiptmentID
          sub
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteEquiptment = /* GraphQL */ `
  mutation DeleteEquiptment(
    $input: DeleteEquiptmentInput!
    $condition: ModelEquiptmentConditionInput
  ) {
    deleteEquiptment(input: $input, condition: $condition) {
      id
      name
      img
      userID
      sub
      ExerciseEquiptmentDetails {
        items {
          id
          exerciseID
          equiptmentID
          sub
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createRunProgress = /* GraphQL */ `
  mutation CreateRunProgress(
    $input: CreateRunProgressInput!
    $condition: ModelRunProgressConditionInput
  ) {
    createRunProgress(input: $input, condition: $condition) {
      id
      date
      coordinates {
        lat
        long
      }
      progressID
      sub
      userID
      totalTime
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateRunProgress = /* GraphQL */ `
  mutation UpdateRunProgress(
    $input: UpdateRunProgressInput!
    $condition: ModelRunProgressConditionInput
  ) {
    updateRunProgress(input: $input, condition: $condition) {
      id
      date
      coordinates {
        lat
        long
      }
      progressID
      sub
      userID
      totalTime
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteRunProgress = /* GraphQL */ `
  mutation DeleteRunProgress(
    $input: DeleteRunProgressInput!
    $condition: ModelRunProgressConditionInput
  ) {
    deleteRunProgress(input: $input, condition: $condition) {
      id
      date
      coordinates {
        lat
        long
      }
      progressID
      sub
      userID
      totalTime
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createIngredient = /* GraphQL */ `
  mutation CreateIngredient(
    $input: CreateIngredientInput!
    $condition: ModelIngredientConditionInput
  ) {
    createIngredient(input: $input, condition: $condition) {
      id
      name
      units
      quantity
      protein
      carbs
      fat
      otherNutrition
      measures
      healthLabels
      totalWeight
      img
      category
      foodContentsLabel
      kcal
      mealID
      edamamId
      userID
      PantryItems {
        items {
          id
          purchased
          ingredientID
          userID
          inCart
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateIngredient = /* GraphQL */ `
  mutation UpdateIngredient(
    $input: UpdateIngredientInput!
    $condition: ModelIngredientConditionInput
  ) {
    updateIngredient(input: $input, condition: $condition) {
      id
      name
      units
      quantity
      protein
      carbs
      fat
      otherNutrition
      measures
      healthLabels
      totalWeight
      img
      category
      foodContentsLabel
      kcal
      mealID
      edamamId
      userID
      PantryItems {
        items {
          id
          purchased
          ingredientID
          userID
          inCart
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteIngredient = /* GraphQL */ `
  mutation DeleteIngredient(
    $input: DeleteIngredientInput!
    $condition: ModelIngredientConditionInput
  ) {
    deleteIngredient(input: $input, condition: $condition) {
      id
      name
      units
      quantity
      protein
      carbs
      fat
      otherNutrition
      measures
      healthLabels
      totalWeight
      img
      category
      foodContentsLabel
      kcal
      mealID
      edamamId
      userID
      PantryItems {
        items {
          id
          purchased
          ingredientID
          userID
          inCart
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createMeal = /* GraphQL */ `
  mutation CreateMeal(
    $input: CreateMealInput!
    $condition: ModelMealConditionInput
  ) {
    createMeal(input: $input, condition: $condition) {
      id
      description
      steps
      premium
      category
      userID
      MealProgresses {
        items {
          id
          name
          mealID
          totalWeight
          consumedWeight
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      sub
      Ingredients {
        items {
          id
          name
          units
          quantity
          protein
          carbs
          fat
          otherNutrition
          measures
          healthLabels
          totalWeight
          img
          category
          foodContentsLabel
          kcal
          mealID
          edamamId
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      name
      media {
        uri
        type
        awsID
      }
      Applications {
        items {
          id
          isDeleted
          approved
          stripeID
          userID
          workoutID
          mealID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      isAiGenerated
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateMeal = /* GraphQL */ `
  mutation UpdateMeal(
    $input: UpdateMealInput!
    $condition: ModelMealConditionInput
  ) {
    updateMeal(input: $input, condition: $condition) {
      id
      description
      steps
      premium
      category
      userID
      MealProgresses {
        items {
          id
          name
          mealID
          totalWeight
          consumedWeight
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      sub
      Ingredients {
        items {
          id
          name
          units
          quantity
          protein
          carbs
          fat
          otherNutrition
          measures
          healthLabels
          totalWeight
          img
          category
          foodContentsLabel
          kcal
          mealID
          edamamId
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      name
      media {
        uri
        type
        awsID
      }
      Applications {
        items {
          id
          isDeleted
          approved
          stripeID
          userID
          workoutID
          mealID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      isAiGenerated
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteMeal = /* GraphQL */ `
  mutation DeleteMeal(
    $input: DeleteMealInput!
    $condition: ModelMealConditionInput
  ) {
    deleteMeal(input: $input, condition: $condition) {
      id
      description
      steps
      premium
      category
      userID
      MealProgresses {
        items {
          id
          name
          mealID
          totalWeight
          consumedWeight
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      sub
      Ingredients {
        items {
          id
          name
          units
          quantity
          protein
          carbs
          fat
          otherNutrition
          measures
          healthLabels
          totalWeight
          img
          category
          foodContentsLabel
          kcal
          mealID
          edamamId
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      name
      media {
        uri
        type
        awsID
      }
      Applications {
        items {
          id
          isDeleted
          approved
          stripeID
          userID
          workoutID
          mealID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      isAiGenerated
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createMealProgress = /* GraphQL */ `
  mutation CreateMealProgress(
    $input: CreateMealProgressInput!
    $condition: ModelMealProgressConditionInput
  ) {
    createMealProgress(input: $input, condition: $condition) {
      id
      name
      mealID
      totalWeight
      consumedWeight
      progressID
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateMealProgress = /* GraphQL */ `
  mutation UpdateMealProgress(
    $input: UpdateMealProgressInput!
    $condition: ModelMealProgressConditionInput
  ) {
    updateMealProgress(input: $input, condition: $condition) {
      id
      name
      mealID
      totalWeight
      consumedWeight
      progressID
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteMealProgress = /* GraphQL */ `
  mutation DeleteMealProgress(
    $input: DeleteMealProgressInput!
    $condition: ModelMealProgressConditionInput
  ) {
    deleteMealProgress(input: $input, condition: $condition) {
      id
      name
      mealID
      totalWeight
      consumedWeight
      progressID
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createFoodProgress = /* GraphQL */ `
  mutation CreateFoodProgress(
    $input: CreateFoodProgressInput!
    $condition: ModelFoodProgressConditionInput
  ) {
    createFoodProgress(input: $input, condition: $condition) {
      id
      name
      kcal
      units
      protein
      carbs
      fat
      otherNutrition
      measures
      healthLabels
      totalWeight
      quantity
      img
      edamamId
      foodContentsLabel
      category
      progressID
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateFoodProgress = /* GraphQL */ `
  mutation UpdateFoodProgress(
    $input: UpdateFoodProgressInput!
    $condition: ModelFoodProgressConditionInput
  ) {
    updateFoodProgress(input: $input, condition: $condition) {
      id
      name
      kcal
      units
      protein
      carbs
      fat
      otherNutrition
      measures
      healthLabels
      totalWeight
      quantity
      img
      edamamId
      foodContentsLabel
      category
      progressID
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteFoodProgress = /* GraphQL */ `
  mutation DeleteFoodProgress(
    $input: DeleteFoodProgressInput!
    $condition: ModelFoodProgressConditionInput
  ) {
    deleteFoodProgress(input: $input, condition: $condition) {
      id
      name
      kcal
      units
      protein
      carbs
      fat
      otherNutrition
      measures
      healthLabels
      totalWeight
      quantity
      img
      edamamId
      foodContentsLabel
      category
      progressID
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      id
      fat
      weight
      goal
      picture
      username
      personalTrainer
      foodProfessional
      Progresses {
        items {
          id
          weight
          fat
          picture
          userID
          date
          sub
          water
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Meals {
        items {
          id
          description
          steps
          premium
          category
          userID
          sub
          name
          isAiGenerated
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Equiptments {
        items {
          id
          name
          img
          userID
          sub
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Exercises {
        items {
          id
          title
          description
          userID
          sub
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      sub
      ExerciseEquiptmentDetails {
        items {
          id
          exerciseID
          equiptmentID
          sub
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Workouts {
        items {
          id
          name
          description
          img
          sub
          premium
          category
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      FoodProgresses {
        items {
          id
          name
          kcal
          units
          protein
          carbs
          fat
          otherNutrition
          measures
          healthLabels
          totalWeight
          quantity
          img
          edamamId
          foodContentsLabel
          category
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      MealProgresses {
        items {
          id
          name
          mealID
          totalWeight
          consumedWeight
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutPlays {
        items {
          id
          sub
          totalTime
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      tier
      Favorites {
        items {
          id
          potentialID
          userID
          type
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Followers {
        items {
          id
          subscribedFrom
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      numFollowers
      Applications {
        items {
          id
          isDeleted
          approved
          stripeID
          userID
          workoutID
          mealID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Ingredients {
        items {
          id
          name
          units
          quantity
          protein
          carbs
          fat
          otherNutrition
          measures
          healthLabels
          totalWeight
          img
          category
          foodContentsLabel
          kcal
          mealID
          edamamId
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      RunProgresses {
        items {
          id
          date
          progressID
          sub
          userID
          totalTime
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutDetails {
        items {
          id
          sets
          reps
          secs
          rest
          workoutID
          exerciseID
          userID
          note
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutDetailModifiers {
        items {
          id
          userID
          rounds
          exercisesPerRound
          restAfterRound
          timePerExercise
          setsPerExercise
          name
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      PantryItems {
        items {
          id
          purchased
          ingredientID
          userID
          inCart
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      id
      fat
      weight
      goal
      picture
      username
      personalTrainer
      foodProfessional
      Progresses {
        items {
          id
          weight
          fat
          picture
          userID
          date
          sub
          water
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Meals {
        items {
          id
          description
          steps
          premium
          category
          userID
          sub
          name
          isAiGenerated
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Equiptments {
        items {
          id
          name
          img
          userID
          sub
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Exercises {
        items {
          id
          title
          description
          userID
          sub
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      sub
      ExerciseEquiptmentDetails {
        items {
          id
          exerciseID
          equiptmentID
          sub
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Workouts {
        items {
          id
          name
          description
          img
          sub
          premium
          category
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      FoodProgresses {
        items {
          id
          name
          kcal
          units
          protein
          carbs
          fat
          otherNutrition
          measures
          healthLabels
          totalWeight
          quantity
          img
          edamamId
          foodContentsLabel
          category
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      MealProgresses {
        items {
          id
          name
          mealID
          totalWeight
          consumedWeight
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutPlays {
        items {
          id
          sub
          totalTime
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      tier
      Favorites {
        items {
          id
          potentialID
          userID
          type
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Followers {
        items {
          id
          subscribedFrom
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      numFollowers
      Applications {
        items {
          id
          isDeleted
          approved
          stripeID
          userID
          workoutID
          mealID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Ingredients {
        items {
          id
          name
          units
          quantity
          protein
          carbs
          fat
          otherNutrition
          measures
          healthLabels
          totalWeight
          img
          category
          foodContentsLabel
          kcal
          mealID
          edamamId
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      RunProgresses {
        items {
          id
          date
          progressID
          sub
          userID
          totalTime
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutDetails {
        items {
          id
          sets
          reps
          secs
          rest
          workoutID
          exerciseID
          userID
          note
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutDetailModifiers {
        items {
          id
          userID
          rounds
          exercisesPerRound
          restAfterRound
          timePerExercise
          setsPerExercise
          name
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      PantryItems {
        items {
          id
          purchased
          ingredientID
          userID
          inCart
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
      id
      fat
      weight
      goal
      picture
      username
      personalTrainer
      foodProfessional
      Progresses {
        items {
          id
          weight
          fat
          picture
          userID
          date
          sub
          water
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Meals {
        items {
          id
          description
          steps
          premium
          category
          userID
          sub
          name
          isAiGenerated
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Equiptments {
        items {
          id
          name
          img
          userID
          sub
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Exercises {
        items {
          id
          title
          description
          userID
          sub
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      sub
      ExerciseEquiptmentDetails {
        items {
          id
          exerciseID
          equiptmentID
          sub
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Workouts {
        items {
          id
          name
          description
          img
          sub
          premium
          category
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      FoodProgresses {
        items {
          id
          name
          kcal
          units
          protein
          carbs
          fat
          otherNutrition
          measures
          healthLabels
          totalWeight
          quantity
          img
          edamamId
          foodContentsLabel
          category
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      MealProgresses {
        items {
          id
          name
          mealID
          totalWeight
          consumedWeight
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutPlays {
        items {
          id
          sub
          totalTime
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      tier
      Favorites {
        items {
          id
          potentialID
          userID
          type
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Followers {
        items {
          id
          subscribedFrom
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      numFollowers
      Applications {
        items {
          id
          isDeleted
          approved
          stripeID
          userID
          workoutID
          mealID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Ingredients {
        items {
          id
          name
          units
          quantity
          protein
          carbs
          fat
          otherNutrition
          measures
          healthLabels
          totalWeight
          img
          category
          foodContentsLabel
          kcal
          mealID
          edamamId
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      RunProgresses {
        items {
          id
          date
          progressID
          sub
          userID
          totalTime
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutDetails {
        items {
          id
          sets
          reps
          secs
          rest
          workoutID
          exerciseID
          userID
          note
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutPlayDetails {
        items {
          id
          reps
          rest
          weight
          secs
          completed
          workoutplayID
          workoutID
          exerciseID
          userID
          workoutdetailsID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      WorkoutDetailModifiers {
        items {
          id
          userID
          rounds
          exercisesPerRound
          restAfterRound
          timePerExercise
          setsPerExercise
          name
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      PantryItems {
        items {
          id
          purchased
          ingredientID
          userID
          inCart
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createProgress = /* GraphQL */ `
  mutation CreateProgress(
    $input: CreateProgressInput!
    $condition: ModelProgressConditionInput
  ) {
    createProgress(input: $input, condition: $condition) {
      id
      weight
      fat
      picture
      userID
      Food {
        items {
          id
          name
          kcal
          units
          protein
          carbs
          fat
          otherNutrition
          measures
          healthLabels
          totalWeight
          quantity
          img
          edamamId
          foodContentsLabel
          category
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      RunProgresses {
        items {
          id
          date
          progressID
          sub
          userID
          totalTime
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      MealProgresses {
        items {
          id
          name
          mealID
          totalWeight
          consumedWeight
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      date
      sub
      water
      activities {
        name
        img
        totalTime
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateProgress = /* GraphQL */ `
  mutation UpdateProgress(
    $input: UpdateProgressInput!
    $condition: ModelProgressConditionInput
  ) {
    updateProgress(input: $input, condition: $condition) {
      id
      weight
      fat
      picture
      userID
      Food {
        items {
          id
          name
          kcal
          units
          protein
          carbs
          fat
          otherNutrition
          measures
          healthLabels
          totalWeight
          quantity
          img
          edamamId
          foodContentsLabel
          category
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      RunProgresses {
        items {
          id
          date
          progressID
          sub
          userID
          totalTime
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      MealProgresses {
        items {
          id
          name
          mealID
          totalWeight
          consumedWeight
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      date
      sub
      water
      activities {
        name
        img
        totalTime
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteProgress = /* GraphQL */ `
  mutation DeleteProgress(
    $input: DeleteProgressInput!
    $condition: ModelProgressConditionInput
  ) {
    deleteProgress(input: $input, condition: $condition) {
      id
      weight
      fat
      picture
      userID
      Food {
        items {
          id
          name
          kcal
          units
          protein
          carbs
          fat
          otherNutrition
          measures
          healthLabels
          totalWeight
          quantity
          img
          edamamId
          foodContentsLabel
          category
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      RunProgresses {
        items {
          id
          date
          progressID
          sub
          userID
          totalTime
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      MealProgresses {
        items {
          id
          name
          mealID
          totalWeight
          consumedWeight
          progressID
          userID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      date
      sub
      water
      activities {
        name
        img
        totalTime
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
