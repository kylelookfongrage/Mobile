/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateWorkoutDetailModifier = /* GraphQL */ `
  subscription OnCreateWorkoutDetailModifier(
    $filter: ModelSubscriptionWorkoutDetailModifierFilterInput
  ) {
    onCreateWorkoutDetailModifier(filter: $filter) {
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
export const onUpdateWorkoutDetailModifier = /* GraphQL */ `
  subscription OnUpdateWorkoutDetailModifier(
    $filter: ModelSubscriptionWorkoutDetailModifierFilterInput
  ) {
    onUpdateWorkoutDetailModifier(filter: $filter) {
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
export const onDeleteWorkoutDetailModifier = /* GraphQL */ `
  subscription OnDeleteWorkoutDetailModifier(
    $filter: ModelSubscriptionWorkoutDetailModifierFilterInput
  ) {
    onDeleteWorkoutDetailModifier(filter: $filter) {
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
export const onCreatePantryItem = /* GraphQL */ `
  subscription OnCreatePantryItem(
    $filter: ModelSubscriptionPantryItemFilterInput
  ) {
    onCreatePantryItem(filter: $filter) {
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
export const onUpdatePantryItem = /* GraphQL */ `
  subscription OnUpdatePantryItem(
    $filter: ModelSubscriptionPantryItemFilterInput
  ) {
    onUpdatePantryItem(filter: $filter) {
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
export const onDeletePantryItem = /* GraphQL */ `
  subscription OnDeletePantryItem(
    $filter: ModelSubscriptionPantryItemFilterInput
  ) {
    onDeletePantryItem(filter: $filter) {
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
export const onCreateApplication = /* GraphQL */ `
  subscription OnCreateApplication(
    $filter: ModelSubscriptionApplicationFilterInput
  ) {
    onCreateApplication(filter: $filter) {
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
export const onUpdateApplication = /* GraphQL */ `
  subscription OnUpdateApplication(
    $filter: ModelSubscriptionApplicationFilterInput
  ) {
    onUpdateApplication(filter: $filter) {
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
export const onDeleteApplication = /* GraphQL */ `
  subscription OnDeleteApplication(
    $filter: ModelSubscriptionApplicationFilterInput
  ) {
    onDeleteApplication(filter: $filter) {
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
export const onCreateFollower = /* GraphQL */ `
  subscription OnCreateFollower($filter: ModelSubscriptionFollowerFilterInput) {
    onCreateFollower(filter: $filter) {
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
export const onUpdateFollower = /* GraphQL */ `
  subscription OnUpdateFollower($filter: ModelSubscriptionFollowerFilterInput) {
    onUpdateFollower(filter: $filter) {
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
export const onDeleteFollower = /* GraphQL */ `
  subscription OnDeleteFollower($filter: ModelSubscriptionFollowerFilterInput) {
    onDeleteFollower(filter: $filter) {
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
export const onCreateFavorite = /* GraphQL */ `
  subscription OnCreateFavorite($filter: ModelSubscriptionFavoriteFilterInput) {
    onCreateFavorite(filter: $filter) {
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
export const onUpdateFavorite = /* GraphQL */ `
  subscription OnUpdateFavorite($filter: ModelSubscriptionFavoriteFilterInput) {
    onUpdateFavorite(filter: $filter) {
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
export const onDeleteFavorite = /* GraphQL */ `
  subscription OnDeleteFavorite($filter: ModelSubscriptionFavoriteFilterInput) {
    onDeleteFavorite(filter: $filter) {
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
export const onCreateExerciseEquiptmentDetail = /* GraphQL */ `
  subscription OnCreateExerciseEquiptmentDetail(
    $filter: ModelSubscriptionExerciseEquiptmentDetailFilterInput
  ) {
    onCreateExerciseEquiptmentDetail(filter: $filter) {
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
export const onUpdateExerciseEquiptmentDetail = /* GraphQL */ `
  subscription OnUpdateExerciseEquiptmentDetail(
    $filter: ModelSubscriptionExerciseEquiptmentDetailFilterInput
  ) {
    onUpdateExerciseEquiptmentDetail(filter: $filter) {
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
export const onDeleteExerciseEquiptmentDetail = /* GraphQL */ `
  subscription OnDeleteExerciseEquiptmentDetail(
    $filter: ModelSubscriptionExerciseEquiptmentDetailFilterInput
  ) {
    onDeleteExerciseEquiptmentDetail(filter: $filter) {
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
export const onCreateWorkoutPlayDetail = /* GraphQL */ `
  subscription OnCreateWorkoutPlayDetail(
    $filter: ModelSubscriptionWorkoutPlayDetailFilterInput
  ) {
    onCreateWorkoutPlayDetail(filter: $filter) {
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
export const onUpdateWorkoutPlayDetail = /* GraphQL */ `
  subscription OnUpdateWorkoutPlayDetail(
    $filter: ModelSubscriptionWorkoutPlayDetailFilterInput
  ) {
    onUpdateWorkoutPlayDetail(filter: $filter) {
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
export const onDeleteWorkoutPlayDetail = /* GraphQL */ `
  subscription OnDeleteWorkoutPlayDetail(
    $filter: ModelSubscriptionWorkoutPlayDetailFilterInput
  ) {
    onDeleteWorkoutPlayDetail(filter: $filter) {
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
export const onCreateWorkoutPlay = /* GraphQL */ `
  subscription OnCreateWorkoutPlay(
    $filter: ModelSubscriptionWorkoutPlayFilterInput
  ) {
    onCreateWorkoutPlay(filter: $filter) {
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
export const onUpdateWorkoutPlay = /* GraphQL */ `
  subscription OnUpdateWorkoutPlay(
    $filter: ModelSubscriptionWorkoutPlayFilterInput
  ) {
    onUpdateWorkoutPlay(filter: $filter) {
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
export const onDeleteWorkoutPlay = /* GraphQL */ `
  subscription OnDeleteWorkoutPlay(
    $filter: ModelSubscriptionWorkoutPlayFilterInput
  ) {
    onDeleteWorkoutPlay(filter: $filter) {
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
export const onCreateWorkoutDetails = /* GraphQL */ `
  subscription OnCreateWorkoutDetails(
    $filter: ModelSubscriptionWorkoutDetailsFilterInput
  ) {
    onCreateWorkoutDetails(filter: $filter) {
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
export const onUpdateWorkoutDetails = /* GraphQL */ `
  subscription OnUpdateWorkoutDetails(
    $filter: ModelSubscriptionWorkoutDetailsFilterInput
  ) {
    onUpdateWorkoutDetails(filter: $filter) {
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
export const onDeleteWorkoutDetails = /* GraphQL */ `
  subscription OnDeleteWorkoutDetails(
    $filter: ModelSubscriptionWorkoutDetailsFilterInput
  ) {
    onDeleteWorkoutDetails(filter: $filter) {
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
export const onCreateWorkout = /* GraphQL */ `
  subscription OnCreateWorkout($filter: ModelSubscriptionWorkoutFilterInput) {
    onCreateWorkout(filter: $filter) {
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
export const onUpdateWorkout = /* GraphQL */ `
  subscription OnUpdateWorkout($filter: ModelSubscriptionWorkoutFilterInput) {
    onUpdateWorkout(filter: $filter) {
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
export const onDeleteWorkout = /* GraphQL */ `
  subscription OnDeleteWorkout($filter: ModelSubscriptionWorkoutFilterInput) {
    onDeleteWorkout(filter: $filter) {
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
export const onCreateExercise = /* GraphQL */ `
  subscription OnCreateExercise($filter: ModelSubscriptionExerciseFilterInput) {
    onCreateExercise(filter: $filter) {
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
export const onUpdateExercise = /* GraphQL */ `
  subscription OnUpdateExercise($filter: ModelSubscriptionExerciseFilterInput) {
    onUpdateExercise(filter: $filter) {
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
export const onDeleteExercise = /* GraphQL */ `
  subscription OnDeleteExercise($filter: ModelSubscriptionExerciseFilterInput) {
    onDeleteExercise(filter: $filter) {
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
export const onCreateEquiptment = /* GraphQL */ `
  subscription OnCreateEquiptment(
    $filter: ModelSubscriptionEquiptmentFilterInput
  ) {
    onCreateEquiptment(filter: $filter) {
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
export const onUpdateEquiptment = /* GraphQL */ `
  subscription OnUpdateEquiptment(
    $filter: ModelSubscriptionEquiptmentFilterInput
  ) {
    onUpdateEquiptment(filter: $filter) {
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
export const onDeleteEquiptment = /* GraphQL */ `
  subscription OnDeleteEquiptment(
    $filter: ModelSubscriptionEquiptmentFilterInput
  ) {
    onDeleteEquiptment(filter: $filter) {
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
export const onCreateRunProgress = /* GraphQL */ `
  subscription OnCreateRunProgress(
    $filter: ModelSubscriptionRunProgressFilterInput
  ) {
    onCreateRunProgress(filter: $filter) {
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
export const onUpdateRunProgress = /* GraphQL */ `
  subscription OnUpdateRunProgress(
    $filter: ModelSubscriptionRunProgressFilterInput
  ) {
    onUpdateRunProgress(filter: $filter) {
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
export const onDeleteRunProgress = /* GraphQL */ `
  subscription OnDeleteRunProgress(
    $filter: ModelSubscriptionRunProgressFilterInput
  ) {
    onDeleteRunProgress(filter: $filter) {
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
export const onCreateIngredient = /* GraphQL */ `
  subscription OnCreateIngredient(
    $filter: ModelSubscriptionIngredientFilterInput
  ) {
    onCreateIngredient(filter: $filter) {
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
export const onUpdateIngredient = /* GraphQL */ `
  subscription OnUpdateIngredient(
    $filter: ModelSubscriptionIngredientFilterInput
  ) {
    onUpdateIngredient(filter: $filter) {
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
export const onDeleteIngredient = /* GraphQL */ `
  subscription OnDeleteIngredient(
    $filter: ModelSubscriptionIngredientFilterInput
  ) {
    onDeleteIngredient(filter: $filter) {
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
export const onCreateMeal = /* GraphQL */ `
  subscription OnCreateMeal($filter: ModelSubscriptionMealFilterInput) {
    onCreateMeal(filter: $filter) {
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
export const onUpdateMeal = /* GraphQL */ `
  subscription OnUpdateMeal($filter: ModelSubscriptionMealFilterInput) {
    onUpdateMeal(filter: $filter) {
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
export const onDeleteMeal = /* GraphQL */ `
  subscription OnDeleteMeal($filter: ModelSubscriptionMealFilterInput) {
    onDeleteMeal(filter: $filter) {
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
export const onCreateMealProgress = /* GraphQL */ `
  subscription OnCreateMealProgress(
    $filter: ModelSubscriptionMealProgressFilterInput
  ) {
    onCreateMealProgress(filter: $filter) {
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
export const onUpdateMealProgress = /* GraphQL */ `
  subscription OnUpdateMealProgress(
    $filter: ModelSubscriptionMealProgressFilterInput
  ) {
    onUpdateMealProgress(filter: $filter) {
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
export const onDeleteMealProgress = /* GraphQL */ `
  subscription OnDeleteMealProgress(
    $filter: ModelSubscriptionMealProgressFilterInput
  ) {
    onDeleteMealProgress(filter: $filter) {
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
export const onCreateFoodProgress = /* GraphQL */ `
  subscription OnCreateFoodProgress(
    $filter: ModelSubscriptionFoodProgressFilterInput
  ) {
    onCreateFoodProgress(filter: $filter) {
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
export const onUpdateFoodProgress = /* GraphQL */ `
  subscription OnUpdateFoodProgress(
    $filter: ModelSubscriptionFoodProgressFilterInput
  ) {
    onUpdateFoodProgress(filter: $filter) {
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
export const onDeleteFoodProgress = /* GraphQL */ `
  subscription OnDeleteFoodProgress(
    $filter: ModelSubscriptionFoodProgressFilterInput
  ) {
    onDeleteFoodProgress(filter: $filter) {
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
    onCreateUser(filter: $filter) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
    onUpdateUser(filter: $filter) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
    onDeleteUser(filter: $filter) {
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
export const onCreateProgress = /* GraphQL */ `
  subscription OnCreateProgress($filter: ModelSubscriptionProgressFilterInput) {
    onCreateProgress(filter: $filter) {
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
export const onUpdateProgress = /* GraphQL */ `
  subscription OnUpdateProgress($filter: ModelSubscriptionProgressFilterInput) {
    onUpdateProgress(filter: $filter) {
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
export const onDeleteProgress = /* GraphQL */ `
  subscription OnDeleteProgress($filter: ModelSubscriptionProgressFilterInput) {
    onDeleteProgress(filter: $filter) {
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
