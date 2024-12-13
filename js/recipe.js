
import { fetchRecipeById, fetchLatestRecipes } from './api.js';

export function initializeRecipePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    
    if (!recipeId) {
        displayError('Recipe ID is missing');
        return;
    }
    
    loadRecipeDetails(recipeId);
}

async function loadRecipeDetails(recipeId) {
    const recipeContent = document.querySelector('.recipe-content');
    if (!recipeContent) return;
    
    showLoader(recipeContent);
    
    try {
        const recipe = await fetchRecipeById(recipeId);
        if (recipe) {
            
            if (recipe.name.toLowerCase().includes('borscht') || 
                recipe.name.toLowerCase().includes('borsch')) {
                recipe.name = "Ukrainian Borscht";
                if (recipe.tags) {
                    recipe.tags = recipe.tags.map(tag => 
                        tag === "Russian" ? "Ukrainian" : tag
                    );
                }
            }
            displayRecipeDetails(recipe);
            loadLatestRecipes(recipeId);
        } else {
            displayError('Recipe not found');
        }
    } catch (error) {
        console.error('Error loading recipe:', error);
        displayError('Failed to load recipe details. Please try again later.');
    }
}

function displayRecipeDetails(recipe) {
    const recipeContent = document.querySelector('.recipe-content');
    if (!recipeContent) return;

 
    recipeContent.innerHTML = `
        <div class="recipe-header">
            <div class="recipe-image">
                <img src="${recipe.image}" alt="${recipe.name}">
            </div>
            <div class="recipe-info-wrapper">
                <h1 class="recipe-title">${recipe.name}</h1>
                <div class="recipe-tags">
                    ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="recipe-meta">
                    <div class="meta-item">
                        <i class="fas fa-users"></i>
                        <span class="servings">${recipe.servings} servings</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span class="time">${recipe.cookTimeMinutes} minutes</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-signal"></i>
                        <span class="difficulty">${recipe.difficulty || 'Medium'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-star"></i>
                        <span class="rating">${recipe.rating?.toFixed(1)} (${recipe.reviewCount || '0'} reviews)</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="recipe-details">
            <section class="section recipe-ingredients">
                <h2>Ingredients</h2>
                <ul>
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            </section>
            <section class="section recipe-instructions">
                <h2>Instructions</h2>
                <ol>
                    ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                </ol>
            </section>
        </div>
    `;

    document.title = `${recipe.name} | Dev-licious`;
}

async function loadLatestRecipes(currentRecipeId) {
    const latestRecipesContainer = document.getElementById('latest-recipes');
    if (!latestRecipesContainer) return;
    
    try {
        const recipes = await fetchLatestRecipes(3, currentRecipeId);
        displayLatestRecipes(recipes, latestRecipesContainer);
    } catch (error) {
        console.error('Error loading latest recipes:', error);
    }
}

function displayLatestRecipes(recipes, container) {
    container.innerHTML = recipes.map(recipe => `
        <article class="recipe-card" onclick="window.location.href='recipe.html?id=${recipe.id}'">
            <div class="recipe-image">
                <img src="${recipe.image}" alt="${recipe.name}">
                <span class="meal-type-badge">${recipe.mealType}</span>
            </div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.name}</h3>
                <div class="recipe-tags">
                    ${recipe.tags?.slice(0, 4).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="recipe-meta">
                    <span class="prep-time">
                        <i class="fas fa-clock"></i>${recipe.cookTimeMinutes} min
                    </span>
                    <span class="rating">
                        <i class="fas fa-star"></i>${recipe.rating?.toFixed(1)}
                    </span>
                    <span class="servings">
                        <i class="fas fa-user"></i>${recipe.servings} servings
                    </span>
                    <span class="difficulty">
                        <i class="fas fa-signal"></i>${recipe.difficulty}
                    </span>
                </div>
            </div>
        </article>
    `).join('');
}

function showLoader(container) {
    container.innerHTML = `
        <div class="loader">
            <div class="loader-spinner"></div>
            <p>Loading recipe details...</p>
        </div>
    `;
}

function displayError(message) {
    const recipeContent = document.querySelector('.recipe-content');
    if (!recipeContent) return;
    
    recipeContent.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            <a href="recipes.html" class="cta-button">Back to Recipes</a>
        </div>
    `;
}