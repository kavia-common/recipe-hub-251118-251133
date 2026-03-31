export interface RecipeSummary {
    id: string;
    title: string;
    slug: string;
    description: string;
    image: string;
    category: string;
    tags: string[];
    cookTimeMinutes: number;
    prepTimeMinutes: number;
    servings: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    rating: number;
    favoriteCount: number;
    isFavorite: boolean;
    authorName: string;
    moderationStatus: 'approved' | 'pending' | 'flagged';
}

export interface RecipeDetail extends RecipeSummary {
    ingredients: string[];
    steps: string[];
    nutrition: {
        calories: number;
        protein: string;
        carbs: string;
        fat: string;
    };
    notes: string;
}

export interface CategorySummary {
    id: string;
    label: string;
    count: number;
}

export interface ShoppingListItem {
    id: string;
    label: string;
    quantity: string;
    checked: boolean;
    recipeTitle: string;
}

export interface FavoriteRecipe {
    id: string;
    recipeId: string;
    recipeTitle: string;
    category: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'member' | 'admin';
    bio: string;
    avatarLabel: string;
}

export interface ModerationQueueItem {
    id: string;
    title: string;
    submittedBy: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface MealPlanItem {
    id: string;
    day: string;
    mealType: string;
    recipeTitle: string;
}

export interface AppData {
    recipes: RecipeSummary[];
    featuredRecipeId: string;
    categories: CategorySummary[];
    tags: string[];
    favoriteRecipes: FavoriteRecipe[];
    shoppingList: ShoppingListItem[];
    profile: UserProfile;
    recipeDetails: Record<string, RecipeDetail>;
    moderationQueue: ModerationQueueItem[];
    mealPlan: MealPlanItem[];
}

export type ActiveView =
    | 'discover'
    | 'recipe'
    | 'favorites'
    | 'shopping'
    | 'create'
    | 'profile'
    | 'moderation';
