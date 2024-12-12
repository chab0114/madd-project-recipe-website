
export function initializeBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) return;

    window.addEventListener('scroll', () => {
        backToTopButton.classList.toggle('visible', window.scrollY > 300);
    });

    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

export function initializeSearchForm() {
    const searchForm = document.querySelector('.search-form');
    if (!searchForm) return;

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchInput = searchForm.querySelector('input[type="search"]');
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm) {
            window.location.href = `recipes.html?keyword=${encodeURIComponent(searchTerm)}`;
        }
    });
}

export function initializeNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('.submit-button');
        const originalButtonText = submitButton.textContent;
        
        submitButton.disabled = true;
        submitButton.textContent = 'Signing up...';

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                form.innerHTML = `
                    <div class="success-message">
                        <h3>Thank you for subscribing!</h3>
                        <p>You'll receive our next newsletter in your inbox.</p>
                    </div>
                `;
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            const errorMessage = document.createElement('p');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Sorry, there was an error. Please try again later.';
            
            const existingError = form.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            form.appendChild(errorMessage);
        }
    });
}