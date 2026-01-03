
let currentSortBy = 'price'; 

async function initializeSortOptions() {
    try {
        const response = await fetch(`${API_BASE_URL}/sort-options`);
        if (!response.ok) throw new Error('Failed to fetch sort options');

        const sortOptions = await response.json();
        renderSortButtons(sortOptions);

        highlightActiveSort('price');
    } catch (error) {
        console.error('Error loading sort options:', error);
   
        const fallbackOptions = [
            { code: 'price', name: 'Prix ↑' },
            { code: 'price_desc', name: 'Prix ↓' },
            { code: 'duration', name: 'Durée ↑' },
            { code: 'duration_desc', name: 'Durée ↓' },
            { code: 'departure', name: 'Départ ↑' },
            { code: 'departure_desc', name: 'Départ ↓' }
        ];
        renderSortButtons(fallbackOptions);
    }
}

// ==========================================
// RENDU DES BOUTONS DE TRI
// ==========================================

function renderSortButtons(sortOptions) {
    const sortContainer = document.querySelector('.sort .col-md-6:last-child .d-flex');

    if (!sortContainer) {
        console.warn('Sort container not found');
        return;
    }

   
    sortContainer.innerHTML = `
        <span class="sort-label me-2">Trier par:</span>
        <div class="btn-group" role="group" id="sortButtonGroup">
            ${sortOptions.map(option => `
                <button type="button" 
                        class="btn btn-outline-primary btn-sm sort-btn" 
                        data-sort="${option.code}"
                        title="${option.name}">
                    ${getSortIcon(option.code)} ${getSortLabel(option.code)}
                </button>
            `).join('')}
        </div>
    `;

    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const sortBy = this.dataset.sort;
            applySortAndRefresh(sortBy);
        });
    });
}

// ==========================================
// OBTENIR LES ICÔNES ET LABELS
// ==========================================

function getSortIcon(sortCode) {
    const icons = {
        'price': '<i class="bi bi-currency-euro"></i>',
        'price_desc': '<i class="bi bi-currency-euro"></i>',
        'duration': '<i class="bi bi-clock"></i>',
        'duration_desc': '<i class="bi bi-clock"></i>',
        'departure': '<i class="bi bi-calendar-event"></i>',
        'departure_desc': '<i class="bi bi-calendar-event"></i>',
        'stops': '<i class="bi bi-geo-alt"></i>'
    };
    return icons[sortCode] || '<i class="bi bi-arrow-down-up"></i>';
}

function getSortLabel(sortCode) {
    const labels = {
        'price': 'Prix',
        'price_desc': 'Prix',
        'duration': 'Durée',
        'duration_desc': 'Durée',
        'departure': 'Départ',
        'departure_desc': 'Départ',
        'stops': 'Escales'
    };

    const arrow = sortCode.includes('_desc') ? ' ↓' : ' ↑';
    return labels[sortCode] + (sortCode !== 'stops' ? arrow : '');
}

async function applySortAndRefresh(sortBy) {
    if (!currentSearchParams) {
        console.warn('No search params available');
        return;
    }


    currentSortBy = sortBy;

    highlightActiveSort(sortBy);
    
    currentSearchParams.sortBy = sortBy;

    await fetchFlights();
}

function highlightActiveSort(sortBy) {

    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
    });

  
    const activeBtn = document.querySelector(`.sort-btn[data-sort="${sortBy}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}


function getCurrentSortBy() {
    return currentSortBy;
}


function resetSort() {
    currentSortBy = 'price';
    highlightActiveSort('price');
}
