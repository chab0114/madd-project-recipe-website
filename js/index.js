import { fetchTopRecipes, fetchRecipeById } from './api.js';

function createLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
        <div class="loader-spinner"></div>
        <p>Loading delicious recipes...</p>
    `;
    return loader;
}

function displayRecipes(recipes, container) {
    container.innerHTML = '';
    
    recipes.forEach(recipe => {
        const article = document.createElement('article');
        article.className = 'recipe-card';
        
        article.addEventListener('click', () => {
            window.location.href = `recipe.html?id=${recipe.id}`;
        });
        
        article.innerHTML = `
            <div class="recipe-image">
                <img src="${recipe.image}" alt="${recipe.name}">
            </div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.name}</h3>
                <div class="recipe-tags">
                    ${recipe.tags?.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
                    <span class="meal-type-badge">${recipe.mealType}</span>
                </div>
                <div class="recipe-meta">
                    <span class="servings"><i class="fas fa-users"></i>${recipe.servings || '4'}</span>
                    <span class="prep-time"><i class="fas fa-clock"></i>${recipe.cookTimeMinutes} min</span>
                    <span class="difficulty"><i class="fas fa-chart-line"></i>${recipe.difficulty || 'Easy'}</span>
                    <span class="rating"><i class="fas fa-star"></i>${recipe.rating?.toFixed(1) || '0.0'}</span>
                </div>
            </div>
        `;
        
        container.appendChild(article);
    });
}

async function initializeTodaysPick() {
    const todaysPickButton = document.querySelector('.cta-button');
    if (!todaysPickButton) return;

    try {
        
        const recipes = await fetchTopRecipes(100);
        const borschtRecipe = recipes.find(recipe => 
            recipe.name.toLowerCase().includes('borscht') || 
            recipe.name.toLowerCase().includes('borsch')
        );

        if (borschtRecipe) {
            
            borschtRecipe.name = "Ukrainian Borscht";
            if (borschtRecipe.tags) {
                borschtRecipe.tags = borschtRecipe.tags.map(tag => 
                    tag === "Russian" ? "Ukrainian" : tag
                );
            }
            
            
            todaysPickButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = `recipe.html?id=${borschtRecipe.id}`;
            });
        }
    } catch (error) {
        console.error('Error setting up Today\'s Pick:', error);
    }
}

export async function initializeHomePage() {
    const recipeGrid = document.getElementById('latest-recipes');
    if (!recipeGrid) return;

    const loader = createLoader();
    recipeGrid.appendChild(loader);
    
    try {
        const recipes = await fetchTopRecipes();
        displayRecipes(recipes, recipeGrid);
        await initializeTodaysPick();
    } catch (error) {
        console.error('Error initializing home page:', error); 
        recipeGrid.innerHTML = '<p class="error">Failed to load recipes. Please try again later.</p>';
    }
}