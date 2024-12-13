
const API_BASE_URL = 'https://dummyjson.com/recipes';

function assignMealType(recipe) {
    const name = recipe.name.toLowerCase();
    const tags = recipe.tags.map(tag => tag.toLowerCase());
    
    if (
        tags.some(tag => 
            tag.includes('breakfast') || 
            tag.includes('brunch') || 
            tag.includes('morning') ||
            tag.includes('egg') ||
            tag.includes('toast')
        ) ||
        name.includes('breakfast') || 
        name.includes('omelette') || 
        name.includes('pancake') ||
        name.includes('waffle') || 
        name.includes('cereal') ||
        name.includes('smoothie') ||
        name.includes('toast') ||
        name.includes('egg') ||
        name.includes('dosa') ||
        name.includes('porridge') ||
        recipe.tags.some(tag => tag.includes('Egg'))
    ) {
        return 'breakfast';
    }
    
    if (
        tags.some(tag => tag.includes('dessert') || tag.includes('sweet') || tag.includes('cake') || 
                        tag.includes('cookie') || tag.includes('ice cream') || tag.includes('chocolate')) ||
        name.includes('cookie') || name.includes('cake') || name.includes('dessert') || 
        name.includes('ice cream') || name.includes('chocolate') || name.includes('brigadeiro')
    ) {
        return 'dessert';
    }
    
    if (
        tags.some(tag => tag.includes('snack') || tag.includes('appetizer') || tag.includes('finger food')) ||
        name.includes('snack') || name.includes('dip') || name.includes('chips') ||
        name.includes('salsa') || name.includes('bruschetta') ||
        name.includes('roll') || name.includes('wrap') || 
        name.includes('spring roll') || name.includes('falafel') ||
        name.includes('patatas') || name.includes('elote')
    ) {
        return 'snack';
    }
    
    if (
        tags.some(tag => tag.includes('lunch') || tag.includes('salad') || tag.includes('sandwich')) ||
        name.includes('salad') || name.includes('sandwich') || name.includes('soup') ||
        name.includes('quinoa')
    ) {
        return 'lunch';
    }
    
    return 'dinner';
}

function normalizeBorschtRecipe(recipe) {
    if (recipe.name.toLowerCase().includes('borscht') || 
        recipe.name.toLowerCase().includes('borsch')) {
        return {
            ...recipe,
            name: "Ukrainian Borscht",
            tags: recipe.tags.map(tag => tag === "Russian" ? "Ukrainian" : tag)
        };
    }
    return recipe;
}

export async function searchRecipes(query) {
    try {
        const limit = 100;
        
       
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];
        const isSearchingMealType = mealTypes.includes(query.toLowerCase());
        
        
        if (isSearchingMealType) {
            const response = await fetch(`${API_BASE_URL}?limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch recipes');
            
            const data = await response.json();
            const recipesWithMealType = data.recipes.map(recipe => ({
                ...recipe,
                mealType: assignMealType(recipe)
            }))
            .map(recipe => normalizeBorschtRecipe(recipe))
            .filter(recipe => recipe.mealType.toLowerCase() === query.toLowerCase());
            
            return recipesWithMealType;
        }
        
        
        const url = query ? 
            `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}` :
            `${API_BASE_URL}?limit=${limit}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to search recipes');
        
        const data = await response.json();
        const recipesWithMealType = data.recipes.map(recipe => ({
            ...recipe,
            mealType: assignMealType(recipe)
        }))
        .map(recipe => normalizeBorschtRecipe(recipe));
        
        return recipesWithMealType;
    } catch (error) {
        throw error;
    }
}

export async function fetchTopRecipes(limit = 6) {
    try {
        const recentlyViewed = getRecentlyViewed(limit);
        console.log('Recently viewed:', recentlyViewed);
        
        if (recentlyViewed.length >= limit) {
            return recentlyViewed.slice(0, limit);
        }
        
        const remainingCount = limit - recentlyViewed.length;
        const response = await fetch(`${API_BASE_URL}?limit=20`);
        if (!response.ok) throw new Error('Failed to fetch recipes');
        const data = await response.json();
        
        const existingIds = recentlyViewed.map(r => r.id);
        const additionalRecipes = data.recipes
            .filter(recipe => !existingIds.includes(recipe.id))
            .map(recipe => ({
                ...recipe,
                mealType: assignMealType(recipe)
            }))
            .map(recipe => normalizeBorschtRecipe(recipe)) 
            .slice(0, remainingCount);
        
        return [...recentlyViewed, ...additionalRecipes];
    } catch (error) {
        console.error('Error in fetchTopRecipes:', error);
        throw error;
    }
}

export async function fetchRecipeById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Recipe not found');
            }
            throw new Error('Failed to fetch recipe');
        }
        
        const recipe = await response.json();
        
        const recipeWithMealType = {
            ...recipe,
            mealType: assignMealType(recipe)
        };

        const normalizedRecipe = normalizeBorschtRecipe(recipeWithMealType);

        const finalRecipe = {
            ...normalizedRecipe,
            difficulty: normalizedRecipe.difficulty || 'Medium',
            servings: normalizedRecipe.servings || 4,
            reviewCount: normalizedRecipe.reviewCount || Math.floor(Math.random() * 200) + 50,
            rating: normalizedRecipe.rating || 4.5,
            cookTimeMinutes: normalizedRecipe.cookTimeMinutes || 30
        };

        addToRecentlyViewed(finalRecipe);

        return finalRecipe;
    } catch (error) {
        throw error;
    }
}

function addToRecentlyViewed(recipe) {
    try {
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const filtered = recentlyViewed.filter(item => item.id !== recipe.id);
        filtered.unshift(recipe);
        const updated = filtered.slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    } catch (error) {
        throw error;
    }
}

export function getRecentlyViewed(limit = 3, excludeId = null) {
    try {
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        return recentlyViewed
            .filter(recipe => recipe.id !== parseInt(excludeId))
            .slice(0, limit);
    } catch (error) {
        return [];
    }
}

export async function fetchLatestRecipes(limit = 3, excludeId = null) {
    const recentlyViewed = getRecentlyViewed(limit, excludeId);
    
    if (recentlyViewed.length >= limit) {
        return recentlyViewed;
    }
    
    try {
        const remainingCount = limit - recentlyViewed.length;
        const response = await fetch(`${API_BASE_URL}?limit=20`);
        if (!response.ok) throw new Error('Failed to fetch recipes');
        const data = await response.json();
        
        const existingIds = [...recentlyViewed.map(r => r.id), parseInt(excludeId)];
        let additionalRecipes = data.recipes
            .filter(recipe => !existingIds.includes(recipe.id))
            .map(recipe => ({
                ...recipe,
                mealType: assignMealType(recipe)
            }))
            .slice(0, remainingCount);
        
        return [...recentlyViewed, ...additionalRecipes];
    } catch (error) {
        return recentlyViewed;
    }
}