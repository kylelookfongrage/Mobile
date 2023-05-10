/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getWorkoutDetailModifier = /* GraphQL */ `
  query GetWorkoutDetailModifier($id: ID!) {
    getWorkoutDetailModifier(id: $id) {
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
export const listWorkoutDetailModifiers = /* GraphQL */ `
  query ListWorkoutDetailModifiers(
    $filter: ModelWorkoutDetailModifierFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWorkoutDetailModifiers(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
  }
`;
export const syncWorkoutDetailModifiers = /* GraphQL */ `
  query SyncWorkoutDetailModifiers(
    $filter: ModelWorkoutDetailModifierFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncWorkoutDetailModifiers(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
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
  }
`;
export const getPantryItem = /* GraphQL */ `
  query GetPantryItem($id: ID!) {
    getPantryItem(id: $id) {
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
export const listPantryItems = /* GraphQL */ `
  query ListPantryItems(
    $filter: ModelPantryItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPantryItems(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
  }
`;
export const syncPantryItems = /* GraphQL */ `
  query SyncPantryItems(
    $filter: ModelPantryItemFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncPantryItems(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
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
  }
`;
export const getApplication = /* GraphQL */ `
  query GetApplication($id: ID!) {
    getApplication(id: $id) {
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
export const listApplications = /* GraphQL */ `
  query ListApplications(
    $filter: ModelApplicationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listApplications(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
  }
`;
export const syncApplications = /* GraphQL */ `
  query SyncApplications(
    $filter: ModelApplicationFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncApplications(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
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
  }
`;
export const getFollower = /* GraphQL */ `
  query GetFollower($id: ID!) {
    getFollower(id: $id) {
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
export const listFollowers = /* GraphQL */ `
  query ListFollowers(
    $filter: ModelFollowerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFollowers(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
  }
`;
export const syncFollowers = /* GraphQL */ `
  query SyncFollowers(
    $filter: ModelFollowerFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncFollowers(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
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
  }
`;
export const getFavorite = /* GraphQL */ `
  query GetFavorite($id: ID!) {
    getFavorite(id: $id) {
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
export const listFavorites = /* GraphQL */ `
  query ListFavorites(
    $filter: ModelFavoriteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFavorites(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
  }
`;
export const syncFavorites = /* GraphQL */ `
  query SyncFavorites(
    $filter: ModelFavoriteFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncFavorites(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
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
  }
`;
export const getExerciseEquiptmentDetail = /* GraphQL */ `
  query GetExerciseEquiptmentDetail($id: ID!) {
    getExerciseEquiptmentDetail(id: $id) {
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
export const listExerciseEquiptmentDetails = /* GraphQL */ `
  query ListExerciseEquiptmentDetails(
    $filter: ModelExerciseEquiptmentDetailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listExerciseEquiptmentDetails(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
  }
`;
export const syncExerciseEquiptmentDetails = /* GraphQL */ `
  query SyncExerciseEquiptmentDetails(
    $filter: ModelExerciseEquiptmentDetailFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncExerciseEquiptmentDetails(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
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
  }
`;
export const getWorkoutPlayDetail = /* GraphQL */ `
  query GetWorkoutPlayDetail($id: ID!) {
    getWorkoutPlayDetail(id: $id) {
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
export const listWorkoutPlayDetails = /* GraphQL */ `
  query ListWorkoutPlayDetails(
    $filter: ModelWorkoutPlayDetailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWorkoutPlayDetails(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
  }
`;
export const syncWorkoutPlayDetails = /* GraphQL */ `
  query SyncWorkoutPlayDetails(
    $filter: ModelWorkoutPlayDetailFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncWorkoutPlayDetails(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
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
  }
`;
export const getWorkoutPlay = /* GraphQL */ `
  query GetWorkoutPlay($id: ID!) {
    getWorkoutPlay(id: $id) {
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
export const listWorkoutPlays = /* GraphQL */ `
  query ListWorkoutPlays(
    $filter: ModelWorkoutPlayFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWorkoutPlays(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        sub
        totalTime
        WorkoutPlayDetails {
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
      nextToken
      startedAt
    }
  }
`;
export const syncWorkoutPlays = /* GraphQL */ `
  query SyncWorkoutPlays(
    $filter: ModelWorkoutPlayFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncWorkoutPlays(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        sub
        totalTime
        WorkoutPlayDetails {
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
      nextToken
      startedAt
    }
  }
`;
export const getWorkoutDetails = /* GraphQL */ `
  query GetWorkoutDetails($id: ID!) {
    getWorkoutDetails(id: $id) {
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
export const listWorkoutDetails = /* GraphQL */ `
  query ListWorkoutDetails(
    $filter: ModelWorkoutDetailsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWorkoutDetails(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
        WorkoutPlayDetails {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncWorkoutDetails = /* GraphQL */ `
  query SyncWorkoutDetails(
    $filter: ModelWorkoutDetailsFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncWorkoutDetails(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
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
        WorkoutPlayDetails {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getWorkout = /* GraphQL */ `
  query GetWorkout($id: ID!) {
    getWorkout(id: $id) {
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
export const listWorkouts = /* GraphQL */ `
  query ListWorkouts(
    $filter: ModelWorkoutFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWorkouts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        img
        sub
        premium
        WorkoutDetails {
          nextToken
          startedAt
        }
        WorkoutPlayDetails {
          nextToken
          startedAt
        }
        category
        userID
        Applications {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncWorkouts = /* GraphQL */ `
  query SyncWorkouts(
    $filter: ModelWorkoutFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncWorkouts(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        name
        description
        img
        sub
        premium
        WorkoutDetails {
          nextToken
          startedAt
        }
        WorkoutPlayDetails {
          nextToken
          startedAt
        }
        category
        userID
        Applications {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getExercise = /* GraphQL */ `
  query GetExercise($id: ID!) {
    getExercise(id: $id) {
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
export const listExercises = /* GraphQL */ `
  query ListExercises(
    $filter: ModelExerciseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listExercises(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
          nextToken
          startedAt
        }
        WorkoutDetails {
          nextToken
          startedAt
        }
        ExerciseEquiptmentDetails {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncExercises = /* GraphQL */ `
  query SyncExercises(
    $filter: ModelExerciseFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncExercises(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
          nextToken
          startedAt
        }
        WorkoutDetails {
          nextToken
          startedAt
        }
        ExerciseEquiptmentDetails {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getEquiptment = /* GraphQL */ `
  query GetEquiptment($id: ID!) {
    getEquiptment(id: $id) {
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
export const listEquiptments = /* GraphQL */ `
  query ListEquiptments(
    $filter: ModelEquiptmentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEquiptments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        img
        userID
        sub
        ExerciseEquiptmentDetails {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncEquiptments = /* GraphQL */ `
  query SyncEquiptments(
    $filter: ModelEquiptmentFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncEquiptments(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        name
        img
        userID
        sub
        ExerciseEquiptmentDetails {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getRunProgress = /* GraphQL */ `
  query GetRunProgress($id: ID!) {
    getRunProgress(id: $id) {
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
export const listRunProgresses = /* GraphQL */ `
  query ListRunProgresses(
    $filter: ModelRunProgressFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRunProgresses(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      startedAt
    }
  }
`;
export const syncRunProgresses = /* GraphQL */ `
  query SyncRunProgresses(
    $filter: ModelRunProgressFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncRunProgresses(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
    }
  }
`;
export const getIngredient = /* GraphQL */ `
  query GetIngredient($id: ID!) {
    getIngredient(id: $id) {
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
export const listIngredients = /* GraphQL */ `
  query ListIngredients(
    $filter: ModelIngredientFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listIngredients(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
        PantryItems {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncIngredients = /* GraphQL */ `
  query SyncIngredients(
    $filter: ModelIngredientFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncIngredients(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
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
        PantryItems {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getMeal = /* GraphQL */ `
  query GetMeal($id: ID!) {
    getMeal(id: $id) {
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
export const listMeals = /* GraphQL */ `
  query ListMeals(
    $filter: ModelMealFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMeals(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        description
        steps
        premium
        category
        userID
        MealProgresses {
          nextToken
          startedAt
        }
        sub
        Ingredients {
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
      nextToken
      startedAt
    }
  }
`;
export const syncMeals = /* GraphQL */ `
  query SyncMeals(
    $filter: ModelMealFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncMeals(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        description
        steps
        premium
        category
        userID
        MealProgresses {
          nextToken
          startedAt
        }
        sub
        Ingredients {
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
      nextToken
      startedAt
    }
  }
`;
export const getMealProgress = /* GraphQL */ `
  query GetMealProgress($id: ID!) {
    getMealProgress(id: $id) {
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
export const listMealProgresses = /* GraphQL */ `
  query ListMealProgresses(
    $filter: ModelMealProgressFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMealProgresses(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
  }
`;
export const syncMealProgresses = /* GraphQL */ `
  query SyncMealProgresses(
    $filter: ModelMealProgressFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncMealProgresses(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
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
  }
`;
export const getFoodProgress = /* GraphQL */ `
  query GetFoodProgress($id: ID!) {
    getFoodProgress(id: $id) {
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
export const listFoodProgresses = /* GraphQL */ `
  query ListFoodProgresses(
    $filter: ModelFoodProgressFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFoodProgresses(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
  }
`;
export const syncFoodProgresses = /* GraphQL */ `
  query SyncFoodProgresses(
    $filter: ModelFoodProgressFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncFoodProgresses(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
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
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        fat
        weight
        goal
        picture
        username
        personalTrainer
        foodProfessional
        Progresses {
          nextToken
          startedAt
        }
        Meals {
          nextToken
          startedAt
        }
        Equiptments {
          nextToken
          startedAt
        }
        Exercises {
          nextToken
          startedAt
        }
        sub
        ExerciseEquiptmentDetails {
          nextToken
          startedAt
        }
        Workouts {
          nextToken
          startedAt
        }
        FoodProgresses {
          nextToken
          startedAt
        }
        MealProgresses {
          nextToken
          startedAt
        }
        WorkoutPlays {
          nextToken
          startedAt
        }
        tier
        Favorites {
          nextToken
          startedAt
        }
        Followers {
          nextToken
          startedAt
        }
        numFollowers
        Applications {
          nextToken
          startedAt
        }
        Ingredients {
          nextToken
          startedAt
        }
        RunProgresses {
          nextToken
          startedAt
        }
        WorkoutDetails {
          nextToken
          startedAt
        }
        WorkoutPlayDetails {
          nextToken
          startedAt
        }
        WorkoutDetailModifiers {
          nextToken
          startedAt
        }
        PantryItems {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncUsers = /* GraphQL */ `
  query SyncUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncUsers(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        fat
        weight
        goal
        picture
        username
        personalTrainer
        foodProfessional
        Progresses {
          nextToken
          startedAt
        }
        Meals {
          nextToken
          startedAt
        }
        Equiptments {
          nextToken
          startedAt
        }
        Exercises {
          nextToken
          startedAt
        }
        sub
        ExerciseEquiptmentDetails {
          nextToken
          startedAt
        }
        Workouts {
          nextToken
          startedAt
        }
        FoodProgresses {
          nextToken
          startedAt
        }
        MealProgresses {
          nextToken
          startedAt
        }
        WorkoutPlays {
          nextToken
          startedAt
        }
        tier
        Favorites {
          nextToken
          startedAt
        }
        Followers {
          nextToken
          startedAt
        }
        numFollowers
        Applications {
          nextToken
          startedAt
        }
        Ingredients {
          nextToken
          startedAt
        }
        RunProgresses {
          nextToken
          startedAt
        }
        WorkoutDetails {
          nextToken
          startedAt
        }
        WorkoutPlayDetails {
          nextToken
          startedAt
        }
        WorkoutDetailModifiers {
          nextToken
          startedAt
        }
        PantryItems {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getProgress = /* GraphQL */ `
  query GetProgress($id: ID!) {
    getProgress(id: $id) {
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
export const listProgresses = /* GraphQL */ `
  query ListProgresses(
    $filter: ModelProgressFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProgresses(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        weight
        fat
        picture
        userID
        Food {
          nextToken
          startedAt
        }
        RunProgresses {
          nextToken
          startedAt
        }
        MealProgresses {
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
      nextToken
      startedAt
    }
  }
`;
export const syncProgresses = /* GraphQL */ `
  query SyncProgresses(
    $filter: ModelProgressFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncProgresses(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        weight
        fat
        picture
        userID
        Food {
          nextToken
          startedAt
        }
        RunProgresses {
          nextToken
          startedAt
        }
        MealProgresses {
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
      nextToken
      startedAt
    }
  }
`;
