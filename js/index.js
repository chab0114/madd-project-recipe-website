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
        
        article.innerHTML = `
            <a href="recipe.html?id=${recipe.id}" class="recipe-link">
                <div class="recipe-image">
                    <img src="${recipe.image}" alt="${recipe.name}">
                    <span class="meal-type-badge">${recipe.mealType}</span>
                </div>
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <div class="recipe-tags">
                        ${recipe.tags?.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
                    </div>
                    <div class="recipe-meta">
                        <span class="servings"><i class="fas fa-users" aria-hidden="true"></i>${recipe.servings || '4'}</span>
                        <span class="prep-time"><i class="fas fa-clock" aria-hidden="true"></i>${recipe.cookTimeMinutes} min</span>
                        <span class="difficulty"><i class="fas fa-chart-line" aria-hidden="true"></i>${recipe.difficulty || 'Easy'}</span>
                        <span class="rating"><i class="fas fa-star" aria-hidden="true"></i>${recipe.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                </div>
            </a>
        `;
        
        container.appendChild(article);
    });
}


let cachedBorschtRecipe = null;

async function initializeTodaysPick() {
    const todaysPickButton = document.querySelector('.cta-button');
    if (!todaysPickButton) return;

   
    todaysPickButton.disabled = true;
    const originalText = todaysPickButton.textContent;
    todaysPickButton.textContent = 'Loading...';

    try {
        
        if (!cachedBorschtRecipe) {
            const recipes = await fetchTopRecipes(100);
            cachedBorschtRecipe = recipes.find(recipe => 
                recipe.name.toLowerCase().includes('borscht') || 
                recipe.name.toLowerCase().includes('borsch')
            );

            if (cachedBorschtRecipe) {
             
                cachedBorschtRecipe.name = "Ukrainian Borscht";
                if (cachedBorschtRecipe.tags) {
                    cachedBorschtRecipe.tags = cachedBorschtRecipe.tags.map(tag => 
                        tag === "Russian" ? "Ukrainian" : tag
                    );
                }

               
                try {
                    await fetchRecipeById(cachedBorschtRecipe.id);
                } catch (error) {
                    console.warn('Failed to pre-fetch full recipe data:', error);
                }
            }
        }

      
        if (cachedBorschtRecipe) {
            todaysPickButton.disabled = false;
            todaysPickButton.textContent = originalText;
            
          
            todaysPickButton.replaceWith(todaysPickButton.cloneNode(true));
            
           
            const freshButton = document.querySelector('.cta-button');
            
           
            freshButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = `recipe.html?id=${cachedBorschtRecipe.id}`;
            });
        } else {
            console.warn('Borscht recipe not found');
            todaysPickButton.textContent = originalText;
            todaysPickButton.disabled = false;
        }
    } catch (error) {
        console.error('Error setting up Today\'s Pick:', error);
        todaysPickButton.disabled = false;
        todaysPickButton.textContent = originalText;
    }
}

export async function initializeHomePage() {
    
    await initializeTodaysPick();
    
    const recipeGrid = document.getElementById('latest-recipes');
    if (!recipeGrid) return;

    const loader = createLoader();
    recipeGrid.appendChild(loader);
    
    try {
        const recipes = await fetchTopRecipes();
        displayRecipes(recipes, recipeGrid);
    } catch (error) {
        console.error('Error initializing home page:', error); 
        recipeGrid.innerHTML = '<p class="error">Failed to load recipes. Please try again later.</p>';
    }
}