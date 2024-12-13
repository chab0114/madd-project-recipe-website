
import { fetchLatestRecipes } from './api.js';

export function initializeBlogPage() {
    loadLatestRecipes();
}

async function loadLatestRecipes() {
    const latestRecipesContainer = document.getElementById('latest-recipes');
    if (!latestRecipesContainer) return;
    
    try {
        latestRecipesContainer.innerHTML = '<div class="loading">Loading latest recipes...</div>';
        
        const recipes = await fetchLatestRecipes(3);
        displayLatestRecipes(recipes, latestRecipesContainer);
    } catch (error) {
        console.error('Error loading latest recipes:', error);
        latestRecipesContainer.innerHTML = '<div class="error">Failed to load recipes. Please try again later.</div>';
    }
}

function displayLatestRecipes(recipes, container) {
    container.innerHTML = '';
    
    recipes.forEach(recipe => {
        const article = document.createElement('article');
        article.className = 'recipe-card';
        
        article.innerHTML = `
            <a href="recipe.html?id=${recipe.id}" class="recipe-link">
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
                            <i class="fas fa-clock" aria-hidden="true"></i>${recipe.cookTimeMinutes} min
                        </span>
                        <span class="rating">
                            <i class="fas fa-star" aria-hidden="true"></i>${recipe.rating?.toFixed(1)}
                        </span>
                        <span class="servings">
                            <i class="fas fa-user" aria-hidden="true"></i>${recipe.servings} servings
                        </span>
                        <span class="difficulty">
                            <i class="fas fa-signal" aria-hidden="true"></i>${recipe.difficulty}
                        </span>
                    </div>
                </div>
            </a>
        `;
        
        container.appendChild(article);
    });
}