'use client';

import { useMemo, useState } from 'react';
import {
    Bookmark,
    ChefHat,
    ClipboardList,
    Heart,
    LogIn,
    Search,
    Settings2,
    ShieldCheck,
    Sparkles,
    UserCircle2,
} from 'lucide-react';

import { filterRecipes, formatMinutes, getDashboardStats, getSelectedRecipe } from '@/lib/recipe-utils';
import type { ActiveView, AppData, MealPlanItem, ModerationQueueItem, RecipeSummary } from '@/types';

interface RecipeHubAppProps {
    appData: AppData;
    apiBaseUrl: string;
}

/**
 * Renders the complete interactive Recipe Hub experience.
 *
 * @param {RecipeHubAppProps} props Component props.
 * @return {JSX.Element} The Recipe Hub application shell.
 */
export default function RecipeHubApp({ appData, apiBaseUrl }: RecipeHubAppProps) {
    const [activeView, setActiveView] = useState<ActiveView>('discover');
    const [activeRecipeId, setActiveRecipeId] = useState<string>(appData.featuredRecipeId);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [activeTag, setActiveTag] = useState<string>('All');
    const [favoriteIds, setFavoriteIds] = useState<string[]>(
        appData.favoriteRecipes.map((item) => item.recipeId),
    );
    const [checkedShoppingItems, setCheckedShoppingItems] = useState<string[]>(
        appData.shoppingList.filter((item) => item.checked).map((item) => item.id),
    );
    const [moderationQueue, setModerationQueue] = useState<ModerationQueueItem[]>(appData.moderationQueue);
    const [mealPlanItems, setMealPlanItems] = useState<MealPlanItem[]>(appData.mealPlan);
    const [draftMessage, setDraftMessage] = useState<string>('');

    const filteredRecipes = useMemo(
        () => filterRecipes(appData.recipes, searchQuery, activeCategory, activeTag),
        [activeCategory, activeTag, appData.recipes, searchQuery],
    );

    const selectedRecipe = useMemo(
        () => getSelectedRecipe(appData, activeRecipeId),
        [activeRecipeId, appData],
    );

    const stats = useMemo(() => {
        return getDashboardStats({
            ...appData,
            favoriteRecipes: appData.favoriteRecipes.filter((item) => favoriteIds.includes(item.recipeId)),
            moderationQueue,
        });
    }, [appData, favoriteIds, moderationQueue]);

    /**
     * Updates the current view and optionally the selected recipe.
     *
     * @param {ActiveView} view The destination view.
     * @param {string=} recipeId Optional selected recipe id.
     * @return {void}
     */
    function goToView(view: ActiveView, recipeId?: string): void {
        setActiveView(view);
        if (recipeId) {
            setActiveRecipeId(recipeId);
        }
    }

    /**
     * Toggles favorite status for the provided recipe id.
     *
     * @param {string} recipeId The recipe id.
     * @return {void}
     */
    function toggleFavorite(recipeId: string): void {
        setFavoriteIds((currentIds) => {
            if (currentIds.includes(recipeId)) {
                return currentIds.filter((id) => id !== recipeId);
            }
            return [...currentIds, recipeId];
        });
    }

    /**
     * Toggles a shopping checklist entry.
     *
     * @param {string} itemId The shopping list item id.
     * @return {void}
     */
    function toggleShoppingItem(itemId: string): void {
        setCheckedShoppingItems((currentIds) => {
            if (currentIds.includes(itemId)) {
                return currentIds.filter((id) => id !== itemId);
            }
            return [...currentIds, itemId];
        });
    }

    /**
     * Applies a moderation action to a queue item.
     *
     * @param {string} itemId Queue item id.
     * @param {'approved'|'rejected'} nextStatus New status.
     * @return {void}
     */
    function moderateRecipe(itemId: string, nextStatus: 'approved' | 'rejected'): void {
        setModerationQueue((currentItems) =>
            currentItems.map((item) =>
                item.id === itemId ? { ...item, status: nextStatus } : item,
            ),
        );
    }

    /**
     * Adds a meal plan reminder entry using the current selected recipe.
     *
     * @return {void}
     */
    function addMealPlanItem(): void {
        const labels = ['Thu', 'Fri', 'Sat', 'Sun'];
        const nextDay = labels[mealPlanItems.length % labels.length];

        setMealPlanItems((currentItems) => [
            ...currentItems,
            {
                id: `mp-${Date.now()}`,
                day: nextDay,
                mealType: 'Dinner',
                recipeTitle: selectedRecipe.title,
            },
        ]);

        setDraftMessage(`Added ${selectedRecipe.title} to the meal plan board.`);
    }

    const favoriteRecipes = appData.recipes.filter((recipe) => favoriteIds.includes(recipe.id));

    return (
        <div className='app-shell'>
            <header className='retro-header'>
                <div className='retro-header__inner'>
                    <button
                        type='button'
                        className='brand-mark'
                        onClick={() => goToView('discover')}
                        aria-label='Go to Recipe Hub home'
                        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                        <span className='brand-mark__icon'>
                            <ChefHat size={20} />
                        </span>
                        <span>
                            <span className='brand-mark__title'>Recipe Hub</span>
                            <span className='brand-mark__subtitle'>Retro kitchen social</span>
                        </span>
                    </button>

                    <nav className='retro-nav' aria-label='Primary'>
                        {[
                            ['discover', 'Discover'],
                            ['favorites', 'Favorites'],
                            ['shopping', 'Shopping'],
                            ['create', 'Create'],
                            ['profile', 'Profile'],
                            ['moderation', 'Moderation'],
                        ].map(([viewKey, label]) => (
                            <button
                                key={viewKey}
                                type='button'
                                className={`retro-nav__link ${
                                    activeView === viewKey ? 'retro-nav__link--active' : ''
                                }`}
                                onClick={() => goToView(viewKey as ActiveView)}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className='header-actions'>
                        <label className='search-shell' aria-label='Search recipes'>
                            <Search size={18} />
                            <input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder='Search recipes, tags, flavors...'
                            />
                        </label>
                        <button type='button' className='icon-button' onClick={() => goToView('favorites')}>
                            <Heart size={18} />
                        </button>
                        <button type='button' className='icon-button' onClick={() => goToView('profile')}>
                            <UserCircle2 size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className='page-frame'>
                <section className='hero-card'>
                    <div className='hero-card__content'>
                        <span className='hero-card__eyebrow'>
                            <Sparkles size={16} />
                            Responsive retro recipe board
                        </span>
                        <h1>Cook, collect, and curate your favorite kitchen hits.</h1>
                        <p>
                            Browse community recipes, save favorites, build a shopping list, manage your
                            profile, and moderate new submissions from one colorful Recipe Hub dashboard.
                        </p>
                        <div className='inline-actions'>
                            <button
                                type='button'
                                className='primary-button'
                                onClick={() => goToView('discover')}
                            >
                                Explore Recipes
                            </button>
                            <button
                                type='button'
                                className='secondary-button'
                                onClick={() => goToView('create')}
                            >
                                Create a Recipe
                            </button>
                        </div>
                        <div className='tag-row'>
                            <span className='tag'>Backend: {apiBaseUrl}</span>
                            <span className='tag'>Fallback data enabled</span>
                            <span className='tag'>Sticky header + responsive grid</span>
                        </div>
                    </div>

                    <div className='hero-card__visual'>
                        <div className='hero-badges'>
                            <div className='hero-badge'>
                                <span className='muted'>Favorites</span>
                                <strong>{favoriteIds.length}</strong>
                            </div>
                            <div className='hero-badge'>
                                <span className='muted'>Recipes</span>
                                <strong>{appData.recipes.length}</strong>
                            </div>
                            <div className='hero-badge'>
                                <span className='muted'>Pending</span>
                                <strong>{stats.pending}</strong>
                            </div>
                        </div>

                        <div className='hero-illustration'>
                            <div className='hero-illustration__row'>
                                <div className='hero-illustration__card'>
                                    <strong>Quick search</strong>
                                    <p className='muted'>Live filters for category, tags, and keywords.</p>
                                </div>
                                <div className='hero-illustration__card'>
                                    <strong>Saved boards</strong>
                                    <p className='muted'>Favorites, lists, and plans in one place.</p>
                                </div>
                            </div>
                            <div className='hero-illustration__row'>
                                <div className='hero-illustration__card'>
                                    <strong>Creator tools</strong>
                                    <p className='muted'>Draft new recipes with details and notes.</p>
                                </div>
                                <div className='hero-illustration__card'>
                                    <strong>Moderation</strong>
                                    <p className='muted'>Review community submissions quickly.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className='stat-grid' aria-label='Dashboard summary'>
                    <article className='stat-card'>
                        <span className='muted'>Approved recipes</span>
                        <strong>{stats.approved}</strong>
                    </article>
                    <article className='stat-card'>
                        <span className='muted'>Active favorites</span>
                        <strong>{stats.favorites}</strong>
                    </article>
                    <article className='stat-card'>
                        <span className='muted'>Shopping items</span>
                        <strong>{stats.shopping}</strong>
                    </article>
                </section>

                <div className='content-grid' style={{ marginTop: '1rem' }}>
                    <aside className='sidebar'>
                        <section className='sidebar-card'>
                            <h2>Categories</h2>
                            <div className='filter-row'>
                                <button
                                    type='button'
                                    className='pill-button'
                                    onClick={() => setActiveCategory('All')}
                                >
                                    All
                                </button>
                                {appData.categories.map((category) => (
                                    <button
                                        key={category.id}
                                        type='button'
                                        className='pill-button'
                                        onClick={() => setActiveCategory(category.label)}
                                    >
                                        {category.label} · {category.count}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className='sidebar-card'>
                            <h2>Tags</h2>
                            <div className='tag-row'>
                                <button
                                    type='button'
                                    className='pill-button'
                                    onClick={() => setActiveTag('All')}
                                >
                                    All
                                </button>
                                {appData.tags.map((tag) => (
                                    <button
                                        key={tag}
                                        type='button'
                                        className='pill-button'
                                        onClick={() => setActiveTag(tag)}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className='sidebar-card'>
                            <h2>Weekly meal plan</h2>
                            <div className='feed-list'>
                                {mealPlanItems.map((item) => (
                                    <div key={item.id} className='feed-item'>
                                        <div className='flex-between'>
                                            <strong>
                                                {item.day} · {item.mealType}
                                            </strong>
                                            <Bookmark size={16} />
                                        </div>
                                        <span className='muted'>{item.recipeTitle}</span>
                                    </div>
                                ))}
                            </div>
                            <div className='inline-actions' style={{ marginTop: '0.8rem' }}>
                                <button type='button' className='secondary-button' onClick={addMealPlanItem}>
                                    Add selected recipe
                                </button>
                            </div>
                        </section>
                    </aside>

                    <section className='stack'>
                        {activeView === 'discover' && (
                            <>
                                <section className='panel'>
                                    <div className='toolbar'>
                                        <div>
                                            <h2 className='section-title'>Recipe feed</h2>
                                            <p className='muted'>
                                                {filteredRecipes.length} recipes match the current search and filters.
                                            </p>
                                        </div>
                                        <div className='filter-row'>
                                            <span className='tag'>Category: {activeCategory}</span>
                                            <span className='tag'>Tag: {activeTag}</span>
                                        </div>
                                    </div>

                                    <div className='recipe-grid'>
                                        {filteredRecipes.map((recipe) => (
                                            <RecipeCard
                                                key={recipe.id}
                                                recipe={recipe}
                                                isFavorite={favoriteIds.includes(recipe.id)}
                                                onFavoriteToggle={toggleFavorite}
                                                onOpen={() => goToView('recipe', recipe.id)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}

                        {activeView === 'recipe' && (
                            <section className='panel recipe-detail'>
                                <div className='toolbar'>
                                    <div>
                                        <h2 className='section-title'>Recipe detail</h2>
                                        <p className='muted'>
                                            Full view with ingredients, steps, notes, and nutrition.
                                        </p>
                                    </div>
                                    <div className='inline-actions'>
                                        <button
                                            type='button'
                                            className='ghost-button'
                                            onClick={() => toggleFavorite(selectedRecipe.id)}
                                        >
                                            <Heart size={16} />
                                            {favoriteIds.includes(selectedRecipe.id) ? 'Unsave' : 'Save'}
                                        </button>
                                        <button
                                            type='button'
                                            className='secondary-button'
                                            onClick={addMealPlanItem}
                                        >
                                            <ClipboardList size={16} />
                                            Add to meal plan
                                        </button>
                                    </div>
                                </div>

                                <div className='recipe-detail__hero'>
                                    <div className='recipe-detail__image' />
                                    <div className='recipe-detail__body'>
                                        <section className='recipe-detail__section'>
                                            <div className='tag-row' style={{ marginBottom: '0.75rem' }}>
                                                <span className='tag'>{selectedRecipe.category}</span>
                                                <span className='tag'>{selectedRecipe.difficulty}</span>
                                                <span className='tag'>⭐ {selectedRecipe.rating.toFixed(1)}</span>
                                            </div>
                                            <h3 style={{ fontSize: '1.8rem', fontWeight: 900 }}>
                                                {selectedRecipe.title}
                                            </h3>
                                            <p className='muted' style={{ marginTop: '0.65rem' }}>
                                                {selectedRecipe.description}
                                            </p>
                                            <ul className='meta-list' style={{ marginTop: '1rem' }}>
                                                <li>Prep: {formatMinutes(selectedRecipe.prepTimeMinutes)}</li>
                                                <li>Cook: {formatMinutes(selectedRecipe.cookTimeMinutes)}</li>
                                                <li>Servings: {selectedRecipe.servings}</li>
                                                <li>By {selectedRecipe.authorName}</li>
                                            </ul>
                                        </section>

                                        <section className='recipe-detail__section'>
                                            <h3 className='section-title'>Nutrition</h3>
                                            <div className='tag-row'>
                                                <span className='tag'>{selectedRecipe.nutrition.calories} cal</span>
                                                <span className='tag'>{selectedRecipe.nutrition.protein} protein</span>
                                                <span className='tag'>{selectedRecipe.nutrition.carbs} carbs</span>
                                                <span className='tag'>{selectedRecipe.nutrition.fat} fat</span>
                                            </div>
                                            <p className='muted' style={{ marginTop: '0.8rem' }}>
                                                {selectedRecipe.notes}
                                            </p>
                                        </section>
                                    </div>
                                </div>

                                <div className='recipe-detail__hero'>
                                    <section className='recipe-detail__section'>
                                        <h3 className='section-title'>Ingredients</h3>
                                        <ul className='recipe-detail__ingredients'>
                                            {selectedRecipe.ingredients.map((ingredient) => (
                                                <li key={ingredient}>• {ingredient}</li>
                                            ))}
                                        </ul>
                                    </section>

                                    <section className='recipe-detail__section'>
                                        <h3 className='section-title'>Steps</h3>
                                        <ol className='recipe-detail__steps'>
                                            {selectedRecipe.steps.map((step, index) => (
                                                <li key={step}>
                                                    <span className='step-index'>{index + 1}</span>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </section>
                                </div>
                            </section>
                        )}

                        {activeView === 'favorites' && (
                            <section className='panel'>
                                <div className='toolbar'>
                                    <div>
                                        <h2 className='section-title'>Favorite recipes</h2>
                                        <p className='muted'>Your saved dishes are pinned here for fast return trips.</p>
                                    </div>
                                    <span className='tag'>{favoriteRecipes.length} saved</span>
                                </div>

                                {favoriteRecipes.length ? (
                                    <div className='recipe-grid'>
                                        {favoriteRecipes.map((recipe) => (
                                            <RecipeCard
                                                key={recipe.id}
                                                recipe={recipe}
                                                isFavorite={true}
                                                onFavoriteToggle={toggleFavorite}
                                                onOpen={() => goToView('recipe', recipe.id)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className='empty-state'>
                                        <p>No favorites yet. Tap the heart icon on any recipe card to save one.</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeView === 'shopping' && (
                            <section className='panel'>
                                <div className='toolbar'>
                                    <div>
                                        <h2 className='section-title'>Shopping list</h2>
                                        <p className='muted'>
                                            Generated from selected recipes and tracked with a quick checklist.
                                        </p>
                                    </div>
                                    <span className='tag'>
                                        {checkedShoppingItems.length}/{appData.shoppingList.length} checked
                                    </span>
                                </div>

                                <div className='feed-list'>
                                    {appData.shoppingList.map((item) => {
                                        const isChecked = checkedShoppingItems.includes(item.id);
                                        return (
                                            <button
                                                key={item.id}
                                                type='button'
                                                className='list-item'
                                                onClick={() => toggleShoppingItem(item.id)}
                                                style={{ textAlign: 'left', cursor: 'pointer' }}
                                            >
                                                <div className='flex-between'>
                                                    <strong>
                                                        {isChecked ? '☑' : '☐'} {item.label}
                                                    </strong>
                                                    <span className='tag'>{item.quantity}</span>
                                                </div>
                                                <span className='muted'>From {item.recipeTitle}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <p className='muted' style={{ marginBottom: '0.35rem' }}>
                                        Pantry progress
                                    </p>
                                    <div className='progress-bar'>
                                        <span
                                            style={{
                                                width: `${
                                                    (checkedShoppingItems.length /
                                                        Math.max(appData.shoppingList.length, 1)) *
                                                    100
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeView === 'create' && (
                            <section className='panel'>
                                <div className='toolbar'>
                                    <div>
                                        <h2 className='section-title'>Create or edit a recipe</h2>
                                        <p className='muted'>
                                            A drawer-style creation surface for recipe submissions and updates.
                                        </p>
                                    </div>
                                </div>

                                <div className='form-grid'>
                                    <div className='form-grid form-grid--two'>
                                        <div className='field'>
                                            <label htmlFor='recipe-title'>Recipe title</label>
                                            <input id='recipe-title' defaultValue='Midnight Tomato Soup' />
                                        </div>
                                        <div className='field'>
                                            <label htmlFor='recipe-category'>Category</label>
                                            <select id='recipe-category' defaultValue='Dinner'>
                                                {['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'].map((item) => (
                                                    <option key={item} value={item}>
                                                        {item}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className='field'>
                                        <label htmlFor='recipe-description'>Description</label>
                                        <textarea
                                            id='recipe-description'
                                            defaultValue='Velvety roasted tomato soup with basil oil and crunchy grilled cheese croutons.'
                                        />
                                    </div>

                                    <div className='form-grid form-grid--two'>
                                        <div className='field'>
                                            <label htmlFor='recipe-tags'>Tags</label>
                                            <input
                                                id='recipe-tags'
                                                defaultValue='Comfort, Retro, Vegetarian'
                                            />
                                        </div>
                                        <div className='field'>
                                            <label htmlFor='recipe-time'>Cook time</label>
                                            <input id='recipe-time' defaultValue='35 minutes' />
                                        </div>
                                    </div>

                                    <div className='field'>
                                        <label htmlFor='recipe-ingredients'>Ingredients</label>
                                        <textarea
                                            id='recipe-ingredients'
                                            defaultValue='Tomatoes
Garlic
Onion
Stock
Cream
Bread
Cheddar'
                                        />
                                    </div>

                                    <div className='field'>
                                        <label htmlFor='recipe-steps'>Steps</label>
                                        <textarea
                                            id='recipe-steps'
                                            defaultValue='Roast vegetables.
Blend until smooth.
Simmer with stock.
Serve with cheese croutons.'
                                        />
                                    </div>

                                    <div className='inline-actions'>
                                        <button
                                            type='button'
                                            className='primary-button'
                                            onClick={() => setDraftMessage('Recipe draft saved locally.')}
                                        >
                                            Save draft
                                        </button>
                                        <button
                                            type='button'
                                            className='secondary-button'
                                            onClick={() =>
                                                setDraftMessage('Recipe submitted for moderation review.')
                                            }
                                        >
                                            Submit for review
                                        </button>
                                    </div>

                                    {draftMessage ? <div className='notice notice--success'>{draftMessage}</div> : null}
                                </div>
                            </section>
                        )}

                        {activeView === 'profile' && (
                            <section className='panel'>
                                <div className='toolbar'>
                                    <div>
                                        <h2 className='section-title'>Profile & account</h2>
                                        <p className='muted'>
                                            Sign-in, preferences, and community activity in a compact drawer-ready view.
                                        </p>
                                    </div>
                                </div>

                                <div className='recipe-detail__hero'>
                                    <section className='recipe-detail__section'>
                                        <div className='flex-between'>
                                            <div>
                                                <span className='tag'>{appData.profile.role}</span>
                                                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '0.7rem' }}>
                                                    {appData.profile.name}
                                                </h3>
                                            </div>
                                            <div
                                                style={{
                                                    width: '4rem',
                                                    height: '4rem',
                                                    borderRadius: '999px',
                                                    border: '3px solid var(--border)',
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    background: '#fef3c7',
                                                    fontWeight: 900,
                                                    boxShadow: 'var(--shadow-soft)',
                                                }}
                                            >
                                                {appData.profile.avatarLabel}
                                            </div>
                                        </div>
                                        <p className='muted' style={{ marginTop: '0.8rem' }}>
                                            {appData.profile.email}
                                        </p>
                                        <p style={{ marginTop: '0.8rem' }}>{appData.profile.bio}</p>
                                        <div className='inline-actions' style={{ marginTop: '1rem' }}>
                                            <button type='button' className='primary-button'>
                                                <LogIn size={16} />
                                                Sign in / Continue
                                            </button>
                                            <button type='button' className='ghost-button'>
                                                <Settings2 size={16} />
                                                Edit profile
                                            </button>
                                        </div>
                                    </section>

                                    <section className='recipe-detail__section'>
                                        <h3 className='section-title'>Community activity</h3>
                                        <div className='feed-list'>
                                            <div className='feed-item'>
                                                <strong>{favoriteIds.length} recipes saved</strong>
                                                <span className='muted'>Favorites board stays synced across views.</span>
                                            </div>
                                            <div className='feed-item'>
                                                <strong>{appData.shoppingList.length} shopping entries</strong>
                                                <span className='muted'>Auto-generated from saved meal ideas.</span>
                                            </div>
                                            <div className='feed-item'>
                                                <strong>{moderationQueue.length} moderation records</strong>
                                                <span className='muted'>Visible because this profile has admin access.</span>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </section>
                        )}

                        {activeView === 'moderation' && (
                            <section className='panel'>
                                <div className='toolbar'>
                                    <div>
                                        <h2 className='section-title'>Moderation queue</h2>
                                        <p className='muted'>
                                            Review newly submitted recipes before they land in the public feed.
                                        </p>
                                    </div>
                                    <span className='tag'>Admin tools</span>
                                </div>

                                <div className='feed-list'>
                                    {moderationQueue.map((item) => (
                                        <div key={item.id} className='feed-item'>
                                            <div className='flex-between'>
                                                <div>
                                                    <strong>{item.title}</strong>
                                                    <p className='muted'>Submitted by {item.submittedBy}</p>
                                                </div>
                                                <span className='tag'>{item.status}</span>
                                            </div>
                                            <p>{item.reason}</p>
                                            <div className='inline-actions'>
                                                <button
                                                    type='button'
                                                    className='primary-button'
                                                    onClick={() => moderateRecipe(item.id, 'approved')}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    type='button'
                                                    className='ghost-button'
                                                    onClick={() => moderateRecipe(item.id, 'rejected')}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </section>

                    <aside className='sidebar'>
                        <section className='sidebar-card'>
                            <h2>Featured recipe</h2>
                            <div className='feed-item'>
                                <strong>{appData.recipeDetails[appData.featuredRecipeId].title}</strong>
                                <span className='muted'>
                                    {appData.recipeDetails[appData.featuredRecipeId].description}
                                </span>
                                <div className='inline-actions'>
                                    <button
                                        type='button'
                                        className='primary-button'
                                        onClick={() => goToView('recipe', appData.featuredRecipeId)}
                                    >
                                        Open feature
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className='sidebar-card'>
                            <h2>User tools</h2>
                            <div className='feed-list'>
                                <button
                                    type='button'
                                    className='list-item'
                                    style={{ textAlign: 'left', cursor: 'pointer' }}
                                    onClick={() => goToView('favorites')}
                                >
                                    <div className='flex-between'>
                                        <strong>Favorites board</strong>
                                        <Heart size={16} />
                                    </div>
                                    <span className='muted'>Review saved recipes.</span>
                                </button>
                                <button
                                    type='button'
                                    className='list-item'
                                    style={{ textAlign: 'left', cursor: 'pointer' }}
                                    onClick={() => goToView('shopping')}
                                >
                                    <div className='flex-between'>
                                        <strong>Shopping drawer</strong>
                                        <ClipboardList size={16} />
                                    </div>
                                    <span className='muted'>Track pantry tasks.</span>
                                </button>
                                <button
                                    type='button'
                                    className='list-item'
                                    style={{ textAlign: 'left', cursor: 'pointer' }}
                                    onClick={() => goToView('moderation')}
                                >
                                    <div className='flex-between'>
                                        <strong>Moderation desk</strong>
                                        <ShieldCheck size={16} />
                                    </div>
                                    <span className='muted'>Manage submitted recipes.</span>
                                </button>
                            </div>
                        </section>

                        <section className='sidebar-card'>
                            <h2>Why this frontend works now</h2>
                            <ul className='sidebar-list'>
                                <li>• Responsive recipe grid and sidebars</li>
                                <li>• Search, favorites, and shopping interactions</li>
                                <li>• Recipe detail, profile, create/edit, moderation views</li>
                                <li>• Backend-aware API client with fallback resilience</li>
                            </ul>
                        </section>
                    </aside>
                </div>
            </main>

            <footer className='footer'>
                <div className='footer__inner'>
                    <div>
                        <strong>Recipe Hub</strong>
                        <p className='muted' style={{ marginTop: '0.4rem' }}>
                            A retro-themed Next.js frontend for recipe discovery, saving, planning, and community moderation.
                        </p>
                    </div>
                    <div className='footer-links'>
                        <button type='button' onClick={() => goToView('discover')}>
                            Discover
                        </button>
                        <button type='button' onClick={() => goToView('favorites')}>
                            Favorites
                        </button>
                        <button type='button' onClick={() => goToView('shopping')}>
                            Shopping
                        </button>
                        <button type='button' onClick={() => goToView('create')}>
                            Create
                        </button>
                    </div>
                    <div className='tag-row'>
                        <span className='tag'>Next.js</span>
                        <span className='tag'>FastAPI-ready</span>
                        <span className='tag'>Retro UI</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

interface RecipeCardProps {
    recipe: RecipeSummary;
    isFavorite: boolean;
    onFavoriteToggle: (recipeId: string) => void;
    onOpen: () => void;
}

/**
 * Renders a single recipe card inside the feed or favorites grid.
 *
 * @param {RecipeCardProps} props Recipe card props.
 * @return {JSX.Element} Styled recipe card.
 */
function RecipeCard({ recipe, isFavorite, onFavoriteToggle, onOpen }: RecipeCardProps) {
    return (
        <article className='recipe-card'>
            <div className='recipe-card__image'>
                <div>
                    <span className='recipe-card__image-badge'>{recipe.category}</span>
                </div>
                <button
                    type='button'
                    className='icon-button'
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    onClick={() => onFavoriteToggle(recipe.id)}
                >
                    <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
            </div>

            <div className='recipe-card__content'>
                <div className='recipe-card__title-row'>
                    <h3 className='recipe-card__title'>{recipe.title}</h3>
                    <span className='tag'>⭐ {recipe.rating.toFixed(1)}</span>
                </div>

                <p className='muted'>{recipe.description}</p>

                <div className='tag-row'>
                    {recipe.tags.map((tag) => (
                        <span key={tag} className='tag'>
                            {tag}
                        </span>
                    ))}
                </div>

                <div className='flex-between'>
                    <span className='muted'>
                        {formatMinutes(recipe.prepTimeMinutes + recipe.cookTimeMinutes)} total ·{' '}
                        {recipe.servings} servings
                    </span>
                    <button type='button' className='primary-button' onClick={onOpen}>
                        Open recipe
                    </button>
                </div>
            </div>
        </article>
    );
}
