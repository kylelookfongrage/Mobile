export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chat_message: {
        Row: {
          chat_room_id: string | null
          created_at: string
          exercise_id: number | null
          food_id: number | null
          id: string
          likes: string[] | null
          meal_id: number | null
          media: Json[] | null
          plan_id: number | null
          post_id: number | null
          user_id: string | null
          workout_id: number | null
        }
        Insert: {
          chat_room_id?: string | null
          created_at?: string
          exercise_id?: number | null
          food_id?: number | null
          id?: string
          likes?: string[] | null
          meal_id?: number | null
          media?: Json[] | null
          plan_id?: number | null
          post_id?: number | null
          user_id?: string | null
          workout_id?: number | null
        }
        Update: {
          chat_room_id?: string | null
          created_at?: string
          exercise_id?: number | null
          food_id?: number | null
          id?: string
          likes?: string[] | null
          meal_id?: number | null
          media?: Json[] | null
          plan_id?: number | null
          post_id?: number | null
          user_id?: string | null
          workout_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_message_chat_room_id_fkey"
            columns: ["chat_room_id"]
            referencedRelation: "chat_room"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_message_exercise_id_fkey"
            columns: ["exercise_id"]
            referencedRelation: "exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_message_food_id_fkey"
            columns: ["food_id"]
            referencedRelation: "food"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_message_meal_id_fkey"
            columns: ["meal_id"]
            referencedRelation: "meal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_message_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "fitness_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_message_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_message_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_message_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workout"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_room: {
        Row: {
          accepted: string[] | null
          cover: string | null
          created_at: string
          id: string
          name: string | null
          users: string[]
        }
        Insert: {
          accepted?: string[] | null
          cover?: string | null
          created_at?: string
          id?: string
          name?: string | null
          users: string[]
        }
        Update: {
          accepted?: string[] | null
          cover?: string | null
          created_at?: string
          id?: string
          name?: string | null
          users?: string[]
        }
        Relationships: []
      }
      comment: {
        Row: {
          comment_reply: number | null
          created_at: string
          description: string | null
          id: number
          post_id: number | null
          user_id: string | null
        }
        Insert: {
          comment_reply?: number | null
          created_at?: string
          description?: string | null
          id?: number
          post_id?: number | null
          user_id?: string | null
        }
        Update: {
          comment_reply?: number | null
          created_at?: string
          description?: string | null
          id?: number
          post_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      equiptment: {
        Row: {
          created_at: string
          description: string | null
          gym: boolean | null
          id: number
          image: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          gym?: boolean | null
          id?: number
          image: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          gym?: boolean | null
          id?: number
          image?: string
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equiptment_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      exercise: {
        Row: {
          created_at: string
          description: string | null
          id: number
          muscles: string[] | null
          name: string | null
          preview: string | null
          public: boolean | null
          tags: string[] | null
          user_id: string | null
          video: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          muscles?: string[] | null
          name?: string | null
          preview?: string | null
          public?: boolean | null
          tags?: string[] | null
          user_id?: string | null
          video?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          muscles?: string[] | null
          name?: string | null
          preview?: string | null
          public?: boolean | null
          tags?: string[] | null
          user_id?: string | null
          video?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      exercise_equiptment: {
        Row: {
          created_at: string
          equiptment_id: number | null
          exercise_id: number | null
          id: number
        }
        Insert: {
          created_at?: string
          equiptment_id?: number | null
          exercise_id?: number | null
          id?: number
        }
        Update: {
          created_at?: string
          equiptment_id?: number | null
          exercise_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercise_equiptment_equiptment_id_fkey"
            columns: ["equiptment_id"]
            referencedRelation: "equiptment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_equiptment_exercise_id_fkey"
            columns: ["exercise_id"]
            referencedRelation: "exercise"
            referencedColumns: ["id"]
          }
        ]
      }
      favorites: {
        Row: {
          comment_id: number | null
          created_at: string
          deleted_at: string | null
          exercise_id: number | null
          favorited_at: string | null
          food_id: number | null
          id: number
          meal_id: number | null
          plan_id: number | null
          post_id: number | null
          user_id: string | null
          workout_id: number | null
        }
        Insert: {
          comment_id?: number | null
          created_at?: string
          deleted_at?: string | null
          exercise_id?: number | null
          favorited_at?: string | null
          food_id?: number | null
          id?: number
          meal_id?: number | null
          plan_id?: number | null
          post_id?: number | null
          user_id?: string | null
          workout_id?: number | null
        }
        Update: {
          comment_id?: number | null
          created_at?: string
          deleted_at?: string | null
          exercise_id?: number | null
          favorited_at?: string | null
          food_id?: number | null
          id?: number
          meal_id?: number | null
          plan_id?: number | null
          post_id?: number | null
          user_id?: string | null
          workout_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_comment_id_fkey"
            columns: ["comment_id"]
            referencedRelation: "comment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_exercise_id_fkey"
            columns: ["exercise_id"]
            referencedRelation: "exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_food_id_fkey"
            columns: ["food_id"]
            referencedRelation: "food"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_meal_id_fkey"
            columns: ["meal_id"]
            referencedRelation: "meal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "fitness_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workout"
            referencedColumns: ["id"]
          }
        ]
      }
      feed: {
        Row: {
          created_at: string
          id: number
          liked: boolean
          post_id: number
          subscription_id: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          liked?: boolean
          post_id: number
          subscription_id?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          liked?: boolean
          post_id?: number
          subscription_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_subscription_id_fkey"
            columns: ["subscription_id"]
            referencedRelation: "subscription"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      fitness_plan: {
        Row: {
          ai: boolean | null
          calories: number | null
          carb_limit: number | null
          carb_percent: number | null
          created_at: string
          description: string | null
          fat_limit: number | null
          fat_percent: number | null
          id: number
          image: string | null
          name: string | null
          originalPlan: number | null
          protein_limit: number | null
          protein_percent: number | null
          tags: string[] | null
          user_id: string | null
        }
        Insert: {
          ai?: boolean | null
          calories?: number | null
          carb_limit?: number | null
          carb_percent?: number | null
          created_at?: string
          description?: string | null
          fat_limit?: number | null
          fat_percent?: number | null
          id?: number
          image?: string | null
          name?: string | null
          originalPlan?: number | null
          protein_limit?: number | null
          protein_percent?: number | null
          tags?: string[] | null
          user_id?: string | null
        }
        Update: {
          ai?: boolean | null
          calories?: number | null
          carb_limit?: number | null
          carb_percent?: number | null
          created_at?: string
          description?: string | null
          fat_limit?: number | null
          fat_percent?: number | null
          id?: number
          image?: string | null
          name?: string | null
          originalPlan?: number | null
          protein_limit?: number | null
          protein_percent?: number | null
          tags?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fitness_plan_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      fitness_plan_details: {
        Row: {
          created_at: string
          day_of_week: number | null
          fitness_plan_id: number | null
          id: number
          meal_id: number | null
          workout_id: number | null
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          fitness_plan_id?: number | null
          id?: number
          meal_id?: number | null
          workout_id?: number | null
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          fitness_plan_id?: number | null
          id?: number
          meal_id?: number | null
          workout_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fitness_plan_details_fitness_plan_id_fkey"
            columns: ["fitness_plan_id"]
            referencedRelation: "fitness_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fitness_plan_details_meal_id_fkey"
            columns: ["meal_id"]
            referencedRelation: "meal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fitness_plan_details_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workout"
            referencedColumns: ["id"]
          }
        ]
      }
      fitness_plan_subscription: {
        Row: {
          created_at: string
          fitness_plan_id: number | null
          id: number
          last_day_progress: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          fitness_plan_id?: number | null
          id?: number
          last_day_progress?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          fitness_plan_id?: number | null
          id?: number
          last_day_progress?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fitness_plan_subscription_fitness_plan_id_fkey"
            columns: ["fitness_plan_id"]
            referencedRelation: "fitness_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fitness_plan_subscription_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      food: {
        Row: {
          barcode: string | null
          calories: number | null
          carbs: number | null
          created_at: string
          edamamId: string | null
          fat: number | null
          healthLabels: string[] | null
          id: number
          image: string | null
          ingredients: string | null
          name: string
          otherNutrition: Json
          protein: number | null
          public: boolean | null
          quantity: number | null
          servingSize: string | null
          servingSizes: Json
          tags: string[] | null
          user_id: string | null
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          calories?: number | null
          carbs?: number | null
          created_at?: string
          edamamId?: string | null
          fat?: number | null
          healthLabels?: string[] | null
          id?: number
          image?: string | null
          ingredients?: string | null
          name: string
          otherNutrition?: Json
          protein?: number | null
          public?: boolean | null
          quantity?: number | null
          servingSize?: string | null
          servingSizes?: Json
          tags?: string[] | null
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          calories?: number | null
          carbs?: number | null
          created_at?: string
          edamamId?: string | null
          fat?: number | null
          healthLabels?: string[] | null
          id?: number
          image?: string | null
          ingredients?: string | null
          name?: string
          otherNutrition?: Json
          protein?: number | null
          public?: boolean | null
          quantity?: number | null
          servingSize?: string | null
          servingSizes?: Json
          tags?: string[] | null
          user_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "food_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      food_progress: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          fat: number | null
          food_id: number | null
          id: number
          otherNutrition: Json | null
          progress_id: string
          protein: number | null
          quantity: number | null
          serving: string | null
          servingSizes: Json
          user_id: string
          weight: number | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          food_id?: number | null
          id?: number
          otherNutrition?: Json | null
          progress_id: string
          protein?: number | null
          quantity?: number | null
          serving?: string | null
          servingSizes?: Json
          user_id: string
          weight?: number | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          food_id?: number | null
          id?: number
          otherNutrition?: Json | null
          progress_id?: string
          protein?: number | null
          quantity?: number | null
          serving?: string | null
          servingSizes?: Json
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "food_progress_food_id_fkey"
            columns: ["food_id"]
            referencedRelation: "food"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_progress_progress_id_fkey"
            columns: ["progress_id"]
            referencedRelation: "progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice: {
        Row: {
          amount_paid: number
          coin_total: number
          created_at: string
          currency: string
          fixed_fees: number | null
          id: number
          paid_date: string
          payout: boolean | null
          stripe_id: string | null
          total_amount: number
          user_id: string | null
          variable_fees: number | null
        }
        Insert: {
          amount_paid: number
          coin_total: number
          created_at?: string
          currency?: string
          fixed_fees?: number | null
          id?: number
          paid_date: string
          payout?: boolean | null
          stripe_id?: string | null
          total_amount: number
          user_id?: string | null
          variable_fees?: number | null
        }
        Update: {
          amount_paid?: number
          coin_total?: number
          created_at?: string
          currency?: string
          fixed_fees?: number | null
          id?: number
          paid_date?: string
          payout?: boolean | null
          stripe_id?: string | null
          total_amount?: number
          user_id?: string | null
          variable_fees?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      meal: {
        Row: {
          ai: boolean | null
          created_at: string
          description: string | null
          id: number
          name: string | null
          preview: string | null
          price: number | null
          public: boolean | null
          steps: string[] | null
          tags: string[] | null
          user_id: string | null
          video: string | null
        }
        Insert: {
          ai?: boolean | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
          preview?: string | null
          price?: number | null
          public?: boolean | null
          steps?: string[] | null
          tags?: string[] | null
          user_id?: string | null
          video?: string | null
        }
        Update: {
          ai?: boolean | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
          preview?: string | null
          price?: number | null
          public?: boolean | null
          steps?: string[] | null
          tags?: string[] | null
          user_id?: string | null
          video?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      meal_ingredients: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          fat: number | null
          food_id: number | null
          id: number
          meal_id: number | null
          otherNutrition: Json | null
          protein: number | null
          quantity: number | null
          servingSize: string | null
          servingSizes: Json | null
          weight: number | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          food_id?: number | null
          id?: number
          meal_id?: number | null
          otherNutrition?: Json | null
          protein?: number | null
          quantity?: number | null
          servingSize?: string | null
          servingSizes?: Json | null
          weight?: number | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          food_id?: number | null
          id?: number
          meal_id?: number | null
          otherNutrition?: Json | null
          protein?: number | null
          quantity?: number | null
          servingSize?: string | null
          servingSizes?: Json | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_ingredients_food_id_fkey"
            columns: ["food_id"]
            referencedRelation: "food"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_ingredients_meal_id_fkey"
            columns: ["meal_id"]
            referencedRelation: "meal"
            referencedColumns: ["id"]
          }
        ]
      }
      meal_progress: {
        Row: {
          consumed_weight: number | null
          created_at: string
          id: number
          meal_id: number | null
          progress_id: string | null
          servingSize: string | null
          servingSizes: Json | null
          total_weight: number | null
        }
        Insert: {
          consumed_weight?: number | null
          created_at?: string
          id?: number
          meal_id?: number | null
          progress_id?: string | null
          servingSize?: string | null
          servingSizes?: Json | null
          total_weight?: number | null
        }
        Update: {
          consumed_weight?: number | null
          created_at?: string
          id?: number
          meal_id?: number | null
          progress_id?: string | null
          servingSize?: string | null
          servingSizes?: Json | null
          total_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_progress_meal_id_fkey"
            columns: ["meal_id"]
            referencedRelation: "meal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_progress_progress_id_fkey"
            columns: ["progress_id"]
            referencedRelation: "progress"
            referencedColumns: ["id"]
          }
        ]
      }
      pantry_item: {
        Row: {
          cart: boolean | null
          created_at: string
          food_id: number | null
          id: number
          purchased: boolean | null
          quantity: number | null
          servingSize: number | null
          user_id: string | null
        }
        Insert: {
          cart?: boolean | null
          created_at?: string
          food_id?: number | null
          id?: number
          purchased?: boolean | null
          quantity?: number | null
          servingSize?: number | null
          user_id?: string | null
        }
        Update: {
          cart?: boolean | null
          created_at?: string
          food_id?: number | null
          id?: number
          purchased?: boolean | null
          quantity?: number | null
          servingSize?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pantry_item_food_id_fkey"
            columns: ["food_id"]
            referencedRelation: "food"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_item_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      post: {
        Row: {
          created_at: string
          description: string | null
          draft: boolean | null
          exercise_id: number | null
          id: number
          likes: number | null
          meal_id: number | null
          media: Json[] | null
          plan_id: number | null
          public: boolean | null
          run_id: number | null
          user_id: string | null
          workout_id: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          draft?: boolean | null
          exercise_id?: number | null
          id?: number
          likes?: number | null
          meal_id?: number | null
          media?: Json[] | null
          plan_id?: number | null
          public?: boolean | null
          run_id?: number | null
          user_id?: string | null
          workout_id?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          draft?: boolean | null
          exercise_id?: number | null
          id?: number
          likes?: number | null
          meal_id?: number | null
          media?: Json[] | null
          plan_id?: number | null
          public?: boolean | null
          run_id?: number | null
          user_id?: string | null
          workout_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_exercise_id_fkey"
            columns: ["exercise_id"]
            referencedRelation: "exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_meal_id_fkey"
            columns: ["meal_id"]
            referencedRelation: "meal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_run_id_fkey"
            columns: ["run_id"]
            referencedRelation: "run_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workout"
            referencedColumns: ["id"]
          }
        ]
      }
      progress: {
        Row: {
          back: string | null
          created_at: string
          date: string
          fat: number | null
          front: string | null
          hip: number | null
          id: string
          left: string | null
          metric: boolean | null
          neck: number | null
          points: number | null
          right: string | null
          user_id: string
          waist: number | null
          water: number | null
          weight: number | null
        }
        Insert: {
          back?: string | null
          created_at?: string
          date?: string
          fat?: number | null
          front?: string | null
          hip?: number | null
          id?: string
          left?: string | null
          metric?: boolean | null
          neck?: number | null
          points?: number | null
          right?: string | null
          user_id: string
          waist?: number | null
          water?: number | null
          weight?: number | null
        }
        Update: {
          back?: string | null
          created_at?: string
          date?: string
          fat?: number | null
          front?: string | null
          hip?: number | null
          id?: string
          left?: string | null
          metric?: boolean | null
          neck?: number | null
          points?: number | null
          right?: string | null
          user_id?: string
          waist?: number | null
          water?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      reports_of_terms: {
        Row: {
          comment_id: number | null
          created_at: string
          description: string
          exercise_id: number | null
          food_id: number | null
          id: number
          meal_id: number | null
          message_id: string | null
          plan_id: number | null
          post_id: number | null
          reason: string
          reported_by: string | null
          user_id: string | null
          workout_id: number | null
        }
        Insert: {
          comment_id?: number | null
          created_at?: string
          description: string
          exercise_id?: number | null
          food_id?: number | null
          id?: number
          meal_id?: number | null
          message_id?: string | null
          plan_id?: number | null
          post_id?: number | null
          reason: string
          reported_by?: string | null
          user_id?: string | null
          workout_id?: number | null
        }
        Update: {
          comment_id?: number | null
          created_at?: string
          description?: string
          exercise_id?: number | null
          food_id?: number | null
          id?: number
          meal_id?: number | null
          message_id?: string | null
          plan_id?: number | null
          post_id?: number | null
          reason?: string
          reported_by?: string | null
          user_id?: string | null
          workout_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_of_terms_comment_id_fkey"
            columns: ["comment_id"]
            referencedRelation: "comment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_of_terms_exercise_id_fkey"
            columns: ["exercise_id"]
            referencedRelation: "exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_of_terms_food_id_fkey"
            columns: ["food_id"]
            referencedRelation: "food"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_of_terms_meal_id_fkey"
            columns: ["meal_id"]
            referencedRelation: "meal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_of_terms_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "fitness_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_of_terms_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_of_terms_reported_by_fkey"
            columns: ["reported_by"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_of_terms_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_of_terms_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workout"
            referencedColumns: ["id"]
          }
        ]
      }
      review: {
        Row: {
          created_at: string
          description: string | null
          id: number
          meal_id: number | null
          plan_id: number | null
          reviewed_by: string | null
          stars: number | null
          user_id: string | null
          workout_id: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          meal_id?: number | null
          plan_id?: number | null
          reviewed_by?: string | null
          stars?: number | null
          user_id?: string | null
          workout_id?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          meal_id?: number | null
          plan_id?: number | null
          reviewed_by?: string | null
          stars?: number | null
          user_id?: string | null
          workout_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "review_meal_id_fkey"
            columns: ["meal_id"]
            referencedRelation: "meal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "fitness_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reviewed_by_fkey"
            columns: ["reviewed_by"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workout"
            referencedColumns: ["id"]
          }
        ]
      }
      run_progress: {
        Row: {
          coordinates: Json[] | null
          created_at: string
          date: string | null
          id: number
          progress_id: string | null
          time: number | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          coordinates?: Json[] | null
          created_at?: string
          date?: string | null
          id?: number
          progress_id?: string | null
          time?: number | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          coordinates?: Json[] | null
          created_at?: string
          date?: string | null
          id?: number
          progress_id?: string | null
          time?: number | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "run_progress_progress_id_fkey"
            columns: ["progress_id"]
            referencedRelation: "progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription: {
        Row: {
          created_at: string
          end_date: string | null
          id: number
          start_date: string | null
          subscribed_from: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: number
          start_date?: string | null
          subscribed_from: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: number
          start_date?: string | null
          subscribed_from?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_subscribed_from_fkey"
            columns: ["subscribed_from"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      user: {
        Row: {
          _user: string | null
          activity: string | null
          allergens: string[] | null
          bio: string | null
          birthday: string | null
          carbLimit: number | null
          created_at: string
          email: string | null
          emailVerified: boolean | null
          fatGoal: number | null
          fatLimit: number | null
          gender: string | null
          goal: string
          goalDate: string | null
          height: number | null
          id: string
          links: string[] | null
          metric: boolean | null
          name: string
          pfp: string | null
          proteinLimit: number | null
          sprite: string | null
          startDate: string | null
          startFat: number | null
          startWeight: number | null
          stripeId: string | null
          subscription_price: number | null
          tags: string[] | null
          tdee: number | null
          username: string
          verified: boolean
          weight: number | null
          weightGoal: number | null
          workoutDays: number[] | null
          workoutMode: string | null
        }
        Insert: {
          _user?: string | null
          activity?: string | null
          allergens?: string[] | null
          bio?: string | null
          birthday?: string | null
          carbLimit?: number | null
          created_at?: string
          email?: string | null
          emailVerified?: boolean | null
          fatGoal?: number | null
          fatLimit?: number | null
          gender?: string | null
          goal?: string
          goalDate?: string | null
          height?: number | null
          id?: string
          links?: string[] | null
          metric?: boolean | null
          name: string
          pfp?: string | null
          proteinLimit?: number | null
          sprite?: string | null
          startDate?: string | null
          startFat?: number | null
          startWeight?: number | null
          stripeId?: string | null
          subscription_price?: number | null
          tags?: string[] | null
          tdee?: number | null
          username: string
          verified?: boolean
          weight?: number | null
          weightGoal?: number | null
          workoutDays?: number[] | null
          workoutMode?: string | null
        }
        Update: {
          _user?: string | null
          activity?: string | null
          allergens?: string[] | null
          bio?: string | null
          birthday?: string | null
          carbLimit?: number | null
          created_at?: string
          email?: string | null
          emailVerified?: boolean | null
          fatGoal?: number | null
          fatLimit?: number | null
          gender?: string | null
          goal?: string
          goalDate?: string | null
          height?: number | null
          id?: string
          links?: string[] | null
          metric?: boolean | null
          name?: string
          pfp?: string | null
          proteinLimit?: number | null
          sprite?: string | null
          startDate?: string | null
          startFat?: number | null
          startWeight?: number | null
          stripeId?: string | null
          subscription_price?: number | null
          tags?: string[] | null
          tdee?: number | null
          username?: string
          verified?: boolean
          weight?: number | null
          weightGoal?: number | null
          workoutDays?: number[] | null
          workoutMode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user__user_fkey"
            columns: ["_user"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      workout: {
        Row: {
          created_at: string
          description: string | null
          id: number
          image: string | null
          name: string
          originalWorkout: number | null
          price: number | null
          tags: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          image?: string | null
          name: string
          originalWorkout?: number | null
          price?: number | null
          tags?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          image?: string | null
          name?: string
          originalWorkout?: number | null
          price?: number | null
          tags?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      workout_details: {
        Row: {
          created_at: string
          exercise_id: number | null
          id: number
          index: number | null
          note: string | null
          reps: number | null
          rest: number | null
          sets: number | null
          time: number | null
          workout_id: number | null
        }
        Insert: {
          created_at?: string
          exercise_id?: number | null
          id?: number
          index?: number | null
          note?: string | null
          reps?: number | null
          rest?: number | null
          sets?: number | null
          time?: number | null
          workout_id?: number | null
        }
        Update: {
          created_at?: string
          exercise_id?: number | null
          id?: number
          index?: number | null
          note?: string | null
          reps?: number | null
          rest?: number | null
          sets?: number | null
          time?: number | null
          workout_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_details_exercise_id_fkey"
            columns: ["exercise_id"]
            referencedRelation: "exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_details_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workout"
            referencedColumns: ["id"]
          }
        ]
      }
      workout_play: {
        Row: {
          created_at: string
          date: string | null
          id: number
          time: number | null
          user_id: string | null
          workout_id: number | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: number
          time?: number | null
          user_id?: string | null
          workout_id?: number | null
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: number
          time?: number | null
          user_id?: string | null
          workout_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_play_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_play_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workout"
            referencedColumns: ["id"]
          }
        ]
      }
      workout_play_details: {
        Row: {
          completed: boolean | null
          created_at: string
          exercise_id: number | null
          id: number
          metric: boolean | null
          reps: number | null
          rest: number | null
          time: number | null
          user_id: string | null
          weight: number | null
          workout_detail_id: number | null
          workout_id: number | null
          workout_play_id: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          exercise_id?: number | null
          id?: number
          metric?: boolean | null
          reps?: number | null
          rest?: number | null
          time?: number | null
          user_id?: string | null
          weight?: number | null
          workout_detail_id?: number | null
          workout_id?: number | null
          workout_play_id?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          exercise_id?: number | null
          id?: number
          metric?: boolean | null
          reps?: number | null
          rest?: number | null
          time?: number | null
          user_id?: string | null
          weight?: number | null
          workout_detail_id?: number | null
          workout_id?: number | null
          workout_play_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_play_details_exercise_id_fkey"
            columns: ["exercise_id"]
            referencedRelation: "exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_play_details_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_play_details_workout_detail_id_fkey"
            columns: ["workout_detail_id"]
            referencedRelation: "workout_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_play_details_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workout"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_play_details_workout_play_id_fkey"
            columns: ["workout_play_id"]
            referencedRelation: "workout_play"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      _vw_search: {
        Row: {
          author: string | null
          created_at: string | null
          identifier: number | null
          image: string | null
          pfp: string | null
          price: number | null
          result: string | null
          search_by: unknown | null
          type: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
      _vw_subscriptions: {
        Row: {
          followers: number | null
          following: number | null
          user_id: string | null
        }
        Relationships: []
      }
      vw_search: {
        Row: {
          author: string | null
          created_at: string | null
          identifier: number | null
          image: string | null
          pfp: string | null
          price: number | null
          result: string | null
          search_by: unknown | null
          type: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
      vw_subscriptions: {
        Row: {
          followers: number | null
          following: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      fn_feed: {
        Args: {
          query_id: string
        }
        Returns: {
          post_id: number
          description: string
          media: Json[]
          workout_id: number
          exercise_id: number
          run_id: number
          meal_id: number
          plan_id: number
          user_id: string
          username: string
          name: string
          pfp: string
          created_at: string
          likes: number
          liked: boolean
          feed_id: number
        }[]
      }
      fn_get_subscription_count: {
        Args: {
          query_id: string
        }
        Returns: {
          user_id: string
          subscribers: number
          subscribees: number
        }[]
      }
      fn_search: {
        Args: {
          keyword: string
        }
        Returns: {
          name: string
          image: string
          username: string
          user_id: string
          author: string
          pfp: string
          price: number
          search_by: unknown
          identifier: number
          type: string
          created_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
