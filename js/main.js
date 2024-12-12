// main.js
import { initializeHomePage } from './index.js';
import { initializeRecipesPage } from './recipes.js';
import { initializeRecipePage } from './recipe.js';
import { initializeBlogPage } from './blog.js';
import { 
    initializeNewsletterForm, 
    initializeBackToTop,
    initializeSearchForm 
} from './components.js';   


document.addEventListener('DOMContentLoaded', () => {
  
    initializeBackToTop();
    initializeNewsletterForm();
    initializeSearchForm();
    
    const body = document.body;
    if (body.id === 'home') {
        initializeHomePage();
    }
    if (body.id === 'recipes') {
        initializeRecipesPage();
    }
    if (body.id === 'recipe') {
        initializeRecipePage();
    }
    if (body.id === 'blog') {
        initializeBlogPage();
    }
});