import type { AppData, RecipeDetail, RecipeSummary } from '@/types';

/**
 * Filters recipes based on active search, category, and tag selections.
 *
 * @param {RecipeSummary[]} recipes The complete recipe list.
 * @param {string} searchQuery Search input entered by the user.
 * @param {string} activeCategory Selected category filter.
 * @param {string} activeTag Selected tag filter.
 * @return {RecipeSummary[]} Filtered recipes to display.
 */
export function filterRecipes(
    recipes: RecipeSummary[],
    searchQuery: string,
    activeCategory: string,
    activeTag: string,
): RecipeSummary[] {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return recipes.filter((recipe) => {
        const matchesQuery =
            !normalizedQuery ||
            recipe.title.toLowerCase().includes(normalizedQuery) ||
            recipe.description.toLowerCase().includes(normalizedQuery) ||
            recipe.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

        const matchesCategory = activeCategory === 'All' || recipe.category === activeCategory;
        const matchesTag = activeTag === 'All' || recipe.tags.includes(activeTag);

        return matchesQuery && matchesCategory && matchesTag;
    });
}

/**
 * Resolves the currently selected recipe detail.
 *
 * @param {AppData} appData All loaded application data.
 * @param {string} recipeId The recipe id currently selected in the UI.
 * @return {RecipeDetail} The resolved recipe detail view model.
 */
export function getSelectedRecipe(appData: AppData, recipeId: string): RecipeDetail {
    return (
        appData.recipeDetails[recipeId] ??
        appData.recipeDetails[appData.featuredRecipeId] ??
        Object.values(appData.recipeDetails)[0]
    );
}

/**
 * Formats a cooking duration in minutes for display.
 *
 * @param {number} minutes Duration in minutes.
 * @return {string} Human readable duration.
 */
export function formatMinutes(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Calculates dashboard summary values from current data.
 *
 * @param {AppData} appData Current application state.
 * @return {{approved:number,favorites:number,shopping:number,pending:number}} Summary counts.
 */
export function getDashboardStats(appData: AppData): {
    approved: number;
    favorites: number;
    shopping: number;
    pending: number;
} {
    return {
        approved: appData.recipes.filter((recipe) => recipe.moderationStatus === 'approved').length,
        favorites: appData.favoriteRecipes.length,
        shopping: appData.shoppingList.length,
        pending: appData.moderationQueue.filter((item) => item.status === 'pending').length,
    };
}
