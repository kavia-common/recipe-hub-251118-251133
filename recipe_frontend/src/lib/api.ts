import { MOCK_APP_DATA } from '@/data/mock-data';
import type { AppData, RecipeDetail, RecipeSummary } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

/**
 * Safely fetches JSON from the backend API.
 *
 * @param {string} path Relative API path.
 * @param {RequestInit=} init Optional fetch options.
 * @return {Promise<T | null>} Parsed response data or null on failure.
 * @template T
 */
async function safeFetchJson<T>(path: string, init?: RequestInit): Promise<T | null> {
    try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...(init?.headers ?? {}),
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        return (await response.json()) as T;
    } catch {
        return null;
    }
}

/**
 * Returns normalized app data by combining backend responses with local fallbacks.
 *
 * @return {Promise<AppData>} Application data ready for rendering.
 */
export async function getAppData(): Promise<AppData> {
    const recipesResponse = await safeFetchJson<RecipeSummary[] | { recipes?: RecipeSummary[] }>(
        '/recipes',
    );

    const recipes = Array.isArray(recipesResponse)
        ? recipesResponse
        : recipesResponse?.recipes ?? MOCK_APP_DATA.recipes;

    const recipeDetails: Record<string, RecipeDetail> = { ...MOCK_APP_DATA.recipeDetails };

    await Promise.all(
        recipes.map(async (recipe) => {
            const detail = await safeFetchJson<RecipeDetail>(`/recipes/${recipe.id}`);
            if (detail) {
                recipeDetails[recipe.id] = detail;
            }
        }),
    );

    const favoritesResponse = await safeFetchJson<AppData['favoriteRecipes']>('/favorites');
    const shoppingListResponse = await safeFetchJson<AppData['shoppingList']>('/shopping-list');
    const profileResponse = await safeFetchJson<AppData['profile']>('/profile');
    const moderationResponse = await safeFetchJson<AppData['moderationQueue']>('/moderation');
    const categoriesResponse = await safeFetchJson<AppData['categories']>('/categories');
    const tagsResponse = await safeFetchJson<AppData['tags']>('/tags');
    const mealPlanResponse = await safeFetchJson<AppData['mealPlan']>('/meal-plan');

    return {
        ...MOCK_APP_DATA,
        recipes,
        recipeDetails,
        favoriteRecipes: favoritesResponse ?? MOCK_APP_DATA.favoriteRecipes,
        shoppingList: shoppingListResponse ?? MOCK_APP_DATA.shoppingList,
        profile: profileResponse ?? MOCK_APP_DATA.profile,
        moderationQueue: moderationResponse ?? MOCK_APP_DATA.moderationQueue,
        categories: categoriesResponse ?? MOCK_APP_DATA.categories,
        tags: tagsResponse ?? MOCK_APP_DATA.tags,
        mealPlan: mealPlanResponse ?? MOCK_APP_DATA.mealPlan,
        featuredRecipeId:
            recipes.find((recipe) => recipe.id === MOCK_APP_DATA.featuredRecipeId)?.id ??
            recipes[0]?.id ??
            MOCK_APP_DATA.featuredRecipeId,
    };
}

/**
 * Returns the configured backend base URL for display in the UI.
 *
 * @return {string} Backend base URL.
 */
export function getApiBaseUrl(): string {
    return API_BASE_URL;
}
