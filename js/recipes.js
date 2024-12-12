
import { searchRecipes } from './api.js';

const currentResultsCache = {};
const RESULTS_PER_PAGE = 9;

export function initializeRecipesPage() {
    initializeFilters();
    handleQueryParams();
    
    const url = new URL(window.location);
    if (!url.searchParams.has('keyword') && !url.searchParams.has('q')) {
        performInitialLoad();
    }
}

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });
    
    const radioInputs = document.querySelectorAll('.menu-item input[type="radio"]');
    radioInputs.forEach(radio => {
        radio.addEventListener('change', handleFilterSelection);
    });
    
    document.addEventListener('click', handleOutsideClick);
}

async function performInitialLoad() {
    showLoader();
    try {
        const results = await searchRecipes('');
        currentResultsCache[''] = results;
        displayResults(results, 0);
    } catch (error) {
        displayError('Failed to load recipes. Please refresh the page.');
    } finally {
        hideLoader();
    }
}

function handleFilterClick(e) {
    e.preventDefault();
    const filterType = e.currentTarget.getAttribute('data-filter');
    const menu = document.getElementById(`${filterType}-menu`);
    
    document.querySelectorAll('.popup-menu.active').forEach(activeMenu => {
        if (activeMenu !== menu) {
            activeMenu.classList.remove('active');
            const otherButton = document.querySelector(`[data-filter="${activeMenu.id.replace('-menu', '')}"]`);
            otherButton.classList.remove('active');
        }
    });
    
    e.currentTarget.classList.toggle('active');
    menu.classList.toggle('active');
}

function handleFilterSelection(e) {
    const radio = e.currentTarget;
    const filterType = radio.name;
    const value = radio.value;
    const button = document.querySelector(`[data-filter="${filterType}"]`);
    const menu = document.getElementById(`${filterType}-menu`);

    const url = new URL(window.location);
    url.searchParams.set(filterType, value);
    url.searchParams.set('page', '0');
    window.history.pushState({}, '', url);

    const label = document.querySelector(`label[for="${radio.id}"]`);
    button.innerHTML = `${label.textContent}<i class="arrow-icon">▼</i>`;
    
    menu.classList.remove('active');
    button.classList.remove('active');

    const keyword = url.searchParams.get('keyword') || url.searchParams.get('q') || '';
    if (currentResultsCache[keyword]) {
        const results = currentResultsCache[keyword];
        const mealType = url.searchParams.get('meal-type');
        const sortBy = url.searchParams.get('sort-by');
        const filteredResults = filterAndSortResults(results, mealType, sortBy);
        displayResults(filteredResults, 0);
    } else {
        performInitialLoad();
    }
}

function handleOutsideClick(e) {
    if (!e.target.closest('.filter-group')) {
        document.querySelectorAll('.popup-menu.active').forEach(menu => {
            menu.classList.remove('active');
            const button = document.querySelector(`[data-filter="${menu.id.replace('-menu', '')}"]`);
            if (button) button.classList.remove('active');
        });
    }
}

async function performSearch(keyword) {
    showLoader();

    try {
        let results = currentResultsCache[keyword] || await searchRecipes(keyword);
        currentResultsCache[keyword] = results;
        saveToLocalStorage(keyword, results);

        const url = new URL(window.location);
        const mealType = url.searchParams.get('meal-type') || 'all';
        const sortBy = url.searchParams.get('sort-by') || 'top-rated';
        const page = parseInt(url.searchParams.get('page')) || 0;

        updateFilterButtons(mealType, sortBy);
        displayResults(filterAndSortResults(results, mealType, sortBy), page);
    } catch (error) {
        displayError('Failed to fetch recipes. Please try again.');
    } finally {
        hideLoader();
    }
}

function updateFilterButtons(mealType, sortBy) {
    const mealTypeButton = document.querySelector('[data-filter="meal-type"]');
    const mealTypeLabel = document.querySelector(`label[for="${mealType}"]`);
    if (mealTypeButton && mealTypeLabel) {
        mealTypeButton.innerHTML = `${mealTypeLabel.textContent}<i class="arrow-icon">▼</i>`;
    }

    const sortByButton = document.querySelector('[data-filter="sort-by"]');
    const sortByLabel = document.querySelector(`label[for="${sortBy}"]`);
    if (sortByButton && sortByLabel) {
        sortByButton.innerHTML = `${sortByLabel.textContent}<i class="arrow-icon">▼</i>`;
    }

    const mealTypeRadio = document.querySelector(`input[name="meal-type"][value="${mealType}"]`);
    const sortByRadio = document.querySelector(`input[name="sort-by"][value="${sortBy}"]`);
    if (mealTypeRadio) mealTypeRadio.checked = true;
    if (sortByRadio) sortByRadio.checked = true;
}

function filterAndSortResults(results, mealType, sortBy) {
    let filteredResults = [...results];

    if (mealType && mealType !== 'all') {
        filteredResults = filteredResults.filter(recipe => {
            return recipe.mealType.toLowerCase() === mealType.toLowerCase();
        });
    }

    if (sortBy) {
        filteredResults.sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'top-rated') {
                return b.rating - a.rating;
            }
            return 0;
        });
    }

    return filteredResults;
}

function displayResults(results, currentPage = 0) {
    const recipeGrid = document.getElementById('recipe-grid');
    const startIndex = currentPage * RESULTS_PER_PAGE;
    const endIndex = startIndex + RESULTS_PER_PAGE;
    const pageResults = results.slice(startIndex, endIndex);

    recipeGrid.innerHTML = '';
    pageResults.forEach(recipe => {
        const recipeElement = createRecipeElement(recipe);
        recipeGrid.appendChild(recipeElement);
    });

    updatePagination(results.length, currentPage);
}

function createRecipeElement(recipe) {
    const article = document.createElement('article');
    article.className = 'recipe-card';
    
    article.addEventListener('click', () => {
        window.location.href = `recipe.html?id=${recipe.id}`;
    });
    
    article.innerHTML = `
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
                <span class="servings"><i class="fas fa-users"></i>${recipe.servings || '4'}</span>
                <span class="prep-time"><i class="fas fa-clock"></i>${recipe.cookTimeMinutes} min</span>
                <span class="difficulty"><i class="fas fa-chart-line"></i>${recipe.difficulty || 'Easy'}</span>
                <span class="rating"><i class="fas fa-star"></i>${recipe.rating?.toFixed(1) || '0.0'}</span>
            </div>
        </div>
    `;
    
    return article;
}

function updatePagination(totalResults, currentPage) {
    const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
    const paginationContainer = document.getElementById('pagination');
    
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';

    const prevLi = document.createElement('li');
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-prev';
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 0;
    if (!prevButton.disabled) {
        prevButton.addEventListener('click', () => {
            navigateToPage(currentPage - 1);
        });
    }
    prevLi.appendChild(prevButton);
    paginationContainer.appendChild(prevLi);

    let startPage = Math.max(0, currentPage - 1);
    let endPage = Math.min(totalPages - 1, startPage + 2);
    
    if (endPage - startPage < 2) {
        startPage = Math.max(0, endPage - 2);
    }

    if (startPage > 0) {
        paginationContainer.appendChild(createPageButton(0, currentPage));
        if (startPage > 1) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.innerHTML = '&hellip;';
            paginationContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createPageButton(i, currentPage));
    }

    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.innerHTML = '&hellip;';
            paginationContainer.appendChild(ellipsis);
        }
        paginationContainer.appendChild(createPageButton(totalPages - 1, currentPage));
    }

    const nextLi = document.createElement('li');
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-next';
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage >= totalPages - 1;
    if (!nextButton.disabled) {
        nextButton.addEventListener('click', () => {
            navigateToPage(currentPage + 1);
        });
    }
    nextLi.appendChild(nextButton);
    paginationContainer.appendChild(nextLi);
}

function createPageButton(pageNumber, currentPage) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'pagination-number';
    if (pageNumber === currentPage) {
        button.classList.add('active');
    }
    button.textContent = pageNumber + 1;
    button.addEventListener('click', () => {
        navigateToPage(pageNumber);
    });
    li.appendChild(button);
    return li;
}

function navigateToPage(pageNumber) {
    const url = new URL(window.location);
    url.searchParams.set('page', pageNumber.toString());
    window.history.pushState({}, '', url);
    
    const mealType = url.searchParams.get('meal-type');
    const sortBy = url.searchParams.get('sort-by');
    const keyword = url.searchParams.get('keyword') || url.searchParams.get('q') || '';
    
    const results = currentResultsCache[keyword] || [];
    const filteredResults = filterAndSortResults(results, mealType, sortBy);
    
    displayResults(filteredResults, pageNumber);

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function showLoader() {
    const loader = document.createElement('div');
    loader.classList.add('loader');
    loader.innerHTML = '<div class="spinner"></div>';
    document.getElementById('recipe-grid').appendChild(loader);
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) loader.remove();
}

function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('error-message');
    errorDiv.textContent = message;
    document.getElementById('recipe-grid').appendChild(errorDiv);
}

function saveToLocalStorage(keyword, results) {
    try {
        localStorage.setItem(`recipe_search_${keyword}`, JSON.stringify(results));
    } catch (error) {
        return null;
    }
}

function getFromLocalStorage(keyword) {
    try {
        const stored = localStorage.getItem(`recipe_search_${keyword}`);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        return null;
    }
}

async function handleQueryParams() {
    const url = new URL(window.location);
    const keyword = url.searchParams.get('keyword');
    const searchQuery = url.searchParams.get('q');
    
    if (keyword || searchQuery) {
        const searchInput = document.querySelector('.search-form input[type="search"]');
        if (searchInput) {
            searchInput.value = keyword || searchQuery;
        }
        
        await performSearch(keyword || searchQuery);
        
        if (searchQuery) {
            url.searchParams.delete('q');
            url.searchParams.set('keyword', searchQuery);
            window.history.replaceState({}, '', url);
        }
    }
}