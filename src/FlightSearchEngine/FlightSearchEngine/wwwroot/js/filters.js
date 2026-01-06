
let activeFilters = {
    airlines: [],
    flightType: 'all',
    maxStops: null,
    departurePeriods: [], // ['morning', 'afternoon', 'evening', 'night']
    arrivalPeriods: [],
    priceMin: null,
    priceMax: null
};

let availableAirlines = new Set();
let availableStops = new Set();
let priceRange = { min: 0, max: 10000 };

const TIME_PERIODS = {
    morning: { label: 'Matin', timeRange: '06h - 12h', start: '06:00', end: '12:00' },
    afternoon: { label: 'Après-midi', timeRange: '12h - 19h', start: '12:00', end: '19:00' },
    evening: { label: 'Soirée', timeRange: '19h - 00h', start: '19:00', end: '23:59' },
    night: { label: 'Nuit', timeRange: '00h - 06h', start: '00:00', end: '06:00' }
};


function initializeFilters() {

    document.getElementById('flightTypeSelect')?.addEventListener('change', function () {
        activeFilters.flightType = this.value;
        applyAllFilters();
    });

    
    document.getElementById('maxStopsSelect')?.addEventListener('change', function () {
        activeFilters.maxStops = this.value === 'all' ? null : parseInt(this.value);
        applyAllFilters();
    });

    initializeTimePeriods();

    initializePriceSlider();

    document.getElementById('resetFilters')?.addEventListener('click', resetAllFilters);

    initializeFlightTypeToggle();
}

function initializeTimePeriods() {
    document.querySelectorAll('.departure-period').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const period = this.value;
            if (this.checked) {
                if (!activeFilters.departurePeriods.includes(period)) {
                    activeFilters.departurePeriods.push(period);
                }
            } else {
                activeFilters.departurePeriods = activeFilters.departurePeriods.filter(p => p !== period);
            }
            applyAllFilters();
        });
    });

    document.querySelectorAll('.arrival-period').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const period = this.value;
            if (this.checked) {
                if (!activeFilters.arrivalPeriods.includes(period)) {
                    activeFilters.arrivalPeriods.push(period);
                }
            } else {
                activeFilters.arrivalPeriods = activeFilters.arrivalPeriods.filter(p => p !== period);
            }
            applyAllFilters();
        });
    });
}

function isTimeInPeriod(time, period) {
    if (!time || !period) return true;

    const periodDef = TIME_PERIODS[period];
    if (!periodDef) return true;


    const normalizedTime = time.trim();

    if (period === 'night') {
        return normalizedTime >= '00:00' && normalizedTime < '06:00';
    }

    if (period === 'evening') {
        return normalizedTime >= '19:00' && normalizedTime <= '23:59';
    }

    return normalizedTime >= periodDef.start && normalizedTime < periodDef.end;
}


function initializePriceSlider() {
    const minSlider = document.getElementById('priceMinSlider');
    const maxSlider = document.getElementById('priceMaxSlider');
    const minDisplay = document.getElementById('priceMinDisplay');
    const maxDisplay = document.getElementById('priceMaxDisplay');
    const track = document.querySelector('.price-slider-track');

    if (!minSlider || !maxSlider) return;

    function updateSlider() {
        let min = parseInt(minSlider.value);
        let max = parseInt(maxSlider.value);

        if (min > max - 10) {
            min = max - 10;
            minSlider.value = min;
        }

        if (minDisplay) minDisplay.textContent = `${min}€`;
        if (maxDisplay) maxDisplay.textContent = `${max}€`;

        const percentMin = ((min - priceRange.min) / (priceRange.max - priceRange.min)) * 100;
        const percentMax = ((max - priceRange.min) / (priceRange.max - priceRange.min)) * 100;

        if (track) {
            track.style.left = percentMin + '%';
            track.style.width = (percentMax - percentMin) + '%';
        }

        activeFilters.priceMin = min;
        activeFilters.priceMax = max;
        applyAllFilters();
    }

    minSlider.addEventListener('input', updateSlider);
    maxSlider.addEventListener('input', updateSlider);
}


function extractAirlines(flights) {
    availableAirlines.clear();

    flights.forEach(flight => {
        if (flight.mainCarrierCode && flight.mainCarrierName) {
            availableAirlines.add(JSON.stringify({
                code: flight.mainCarrierCode,
                name: flight.mainCarrierName
            }));
        }
    });

    renderAirlineFilters();
}


function initializeFlightTypeToggle() {
    const flightTypeSelect = document.getElementById('flightTypeSelect');
    const stopsSection = document.querySelector('.filter-section:has(#maxStopsSelect)');

    if (flightTypeSelect && stopsSection) {
        flightTypeSelect.addEventListener('change', function () {
            if (this.value === 'direct') {
                stopsSection.style.display = 'none';
            } else {
                stopsSection.style.display = 'block';
            }
        });
    }
}
function extractAvailableStops(flights) {
    availableStops.clear();

    flights.forEach(flight => {
        if (flight.numberOfStops !== undefined) {
            availableStops.add(flight.numberOfStops);
        } else if (flight.isDirect !== undefined) {
            availableStops.add(flight.isDirect ? 0 : 1);
        }
    });

    renderStopsFilter();
}

function renderAirlineFilters() {
    const container = document.getElementById('airlineFilters');
    if (!container) return;

    const airlines = Array.from(availableAirlines)
        .map(str => JSON.parse(str))
        .sort((a, b) => a.name.localeCompare(b.name));

    if (airlines.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <p>Effectuez une recherche</p>
            </div>
        `;
        return;
    }

    container.innerHTML = airlines.map(airline => `
        <div class="form-check">
            <input class="form-check-input airline-checkbox" 
                   type="checkbox" 
                   value="${airline.code}" 
                   id="airline_${airline.code}">
            <label class="form-check-label" for="airline_${airline.code}">
                <img src="https://images.kiwi.com/airlines/64/${airline.code}.png" 
                     alt="${airline.name}" 
                     class="airline-filter-logo"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
                <span class="airline-name-text">${airline.name}</span>
            </label>
        </div>
    `).join('');

    container.querySelectorAll('.airline-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                if (!activeFilters.airlines.includes(this.value)) {
                    activeFilters.airlines.push(this.value);
                }
            } else {
                activeFilters.airlines = activeFilters.airlines.filter(code => code !== this.value);
            }
            applyAllFilters();
        });
    });
}

function renderStopsFilter() {
    const select = document.getElementById('maxStopsSelect');
    if (!select) return;

    const stops = Array.from(availableStops).sort((a, b) => a - b);

    if (stops.length === 0) {
        select.innerHTML = '<option value="all">Toutes</option>';
        return;
    }

    let options = '<option value="all">Toutes les escales</option>';

    if (stops.length === 1 && stops[0] === 0) {
        options = '<option value="0">Vols directs uniquement</option>';
    } else {
        stops.forEach(stopCount => {
            if (stopCount === 0) {
                options += '<option value="0">Vols directs (0 escale)</option>';
            } else {
                options += `<option value="${stopCount}">${stopCount} escale${stopCount > 1 ? 's' : ''}</option>`;
            }
        });
    }

    select.innerHTML = options;
}


function applyAllFilters() {
    // Reset to page 1 when filters change
    if (typeof currentPage !== 'undefined') {
        currentPage = 1;
    }
    
    // Update active filters display
    updateActiveFiltersDisplay();
    
    // Re-render with filters applied
    if (typeof renderCurrentPage === 'function') {
        renderCurrentPage();
    }
}

function checkFlightAgainstFilters(flightCard) {
    const flightData = extractFlightData(flightCard);

    if (activeFilters.airlines.length > 0) {
        if (!activeFilters.airlines.includes(flightData.airlineCode)) {
            return false;
        }
    }

  
    if (activeFilters.flightType === 'direct' && !flightData.isDirect) {
        return false;
    } else if (activeFilters.flightType === 'stopover' && flightData.isDirect) {
        return false;
    }

    if (activeFilters.maxStops !== null && flightData.numberOfStops !== activeFilters.maxStops) {
        return false;
    }

    if (activeFilters.departurePeriods.length > 0) {
        const matchesPeriod = activeFilters.departurePeriods.some(period => {
            const result = isTimeInPeriod(flightData.departureTime, period);
            if (period === 'night') {
                console.log(`Checking departure ${flightData.departureTime} for period ${period}: ${result}`);
            }
            return result;
        });
        if (!matchesPeriod) return false;
    }

    if (activeFilters.arrivalPeriods.length > 0) {
        const matchesPeriod = activeFilters.arrivalPeriods.some(period => {
            const result = isTimeInPeriod(flightData.arrivalTime, period);
            if (activeFilters.arrivalPeriods.includes('night')) {
                console.log(`Checking arrival ${flightData.arrivalTime} for period ${period}: ${result}`);
            }
            return result;
        });
        if (!matchesPeriod) return false;
    }

    if (activeFilters.priceMin !== null && flightData.price < activeFilters.priceMin) {
        return false;
    }

    if (activeFilters.priceMax !== null && flightData.price > activeFilters.priceMax) {
        return false;
    }

    return true;
}

function extractFlightData(flightCard) {
    // Read directly from data attributes (much more reliable)
    const price = parseFloat(flightCard.dataset.price) || 0;
    const airlineCode = flightCard.dataset.airline || '';
    const numberOfStops = parseInt(flightCard.dataset.stops) || 0;
    const isDirect = flightCard.dataset.type === 'direct';
    const departureTime = flightCard.dataset.depTime || '00:00';
    const arrivalTime = flightCard.dataset.arrTime || '00:00';

    return {
        airlineCode,
        departureTime,
        arrivalTime,
        price,
        isDirect,
        numberOfStops
    };
}

function updateResultsCount(count) {
    const countElement = document.getElementById('resultsCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

function updateActiveFiltersDisplay() {
    const container = document.getElementById('activeFilters');
    if (!container) return;

    const badges = [];

    if (activeFilters.airlines.length > 0) {
        activeFilters.airlines.forEach(code => {
            badges.push(`
                <span class="filter-badge airline-badge">
                    <i class="bi bi-building"></i>
                    ${code}
                    <button type="button" class="badge-close" onclick="removeAirlineFilter('${code}')">
                        <i class="bi bi-x"></i>
                    </button>
                </span>
            `);
        });
    }

    if (activeFilters.flightType === 'direct') {
        badges.push(`
            <span class="filter-badge direct-badge">
                <i class="bi bi-airplane"></i>
                Vol direct
                <button type="button" class="badge-close" onclick="removeFlightTypeFilter()">
                    <i class="bi bi-x"></i>
                </button>
            </span>
        `);
    } else if (activeFilters.flightType === 'stopover') {
        badges.push(`
            <span class="filter-badge stops-badge">
                <i class="bi bi-geo-alt"></i>
                Avec escale
                <button type="button" class="badge-close" onclick="removeFlightTypeFilter()">
                    <i class="bi bi-x"></i>
                </button>
            </span>
        `);
    }

    if (activeFilters.maxStops !== null) {
        badges.push(`
            <span class="filter-badge stops-badge">
                <i class="bi bi-geo-alt"></i>
                ${activeFilters.maxStops} escale${activeFilters.maxStops > 1 ? 's' : ''}
                <button type="button" class="badge-close" onclick="removeMaxStopsFilter()">
                    <i class="bi bi-x"></i>
                </button>
            </span>
        `);
    }

    if (activeFilters.departurePeriods.length > 0) {
        const periodsText = activeFilters.departurePeriods.map(p => TIME_PERIODS[p].label).join(', ');
        badges.push(`
            <span class="filter-badge time-badge">
                <i class="bi bi-sunrise"></i>
                Départ: ${periodsText}
                <button type="button" class="badge-close" onclick="removeDeparturePeriodsFilter()">
                    <i class="bi bi-x"></i>
                </button>
            </span>
        `);
    }

    if (activeFilters.arrivalPeriods.length > 0) {
        const periodsText = activeFilters.arrivalPeriods.map(p => TIME_PERIODS[p].label).join(', ');
        badges.push(`
            <span class="filter-badge time-badge">
                <i class="bi bi-sunset"></i>
                Arrivée: ${periodsText}
                <button type="button" class="badge-close" onclick="removeArrivalPeriodsFilter()">
                    <i class="bi bi-x"></i>
                </button>
            </span>
        `);
    }

    if (activeFilters.priceMin !== null || activeFilters.priceMax !== null) {
        const min = activeFilters.priceMin || priceRange.min;
        const max = activeFilters.priceMax || priceRange.max;
        if (min !== priceRange.min || max !== priceRange.max) {
            badges.push(`
                <span class="filter-badge price-badge">
                    <i class="bi bi-currency-euro"></i>
                    ${min}€ - ${max}€
                    <button type="button" class="badge-close" onclick="removePriceFilter()">
                        <i class="bi bi-x"></i>
                    </button>
                </span>
            `);
        }
    }

    if (badges.length > 0) {
        container.style.display = 'block';
        container.innerHTML = `
            <div class="active-filters-title">
                <i class="bi bi-funnel-fill"></i>
                Filtres actifs
            </div>
            <div class="active-filters-container">
                ${badges.join('')}
            </div>
        `;
    } else {
        container.style.display = 'none';
    }
}


function removeAirlineFilter(code) {
    activeFilters.airlines = activeFilters.airlines.filter(c => c !== code);
    const checkbox = document.getElementById(`airline_${code}`);
    if (checkbox) checkbox.checked = false;
    applyAllFilters();
}

function removeFlightTypeFilter() {
    activeFilters.flightType = 'all';
    const select = document.getElementById('flightTypeSelect');
    if (select) select.value = 'all';
    applyAllFilters();
}

function removeMaxStopsFilter() {
    activeFilters.maxStops = null;
    const select = document.getElementById('maxStopsSelect');
    if (select) select.value = 'all';
    applyAllFilters();
}

function removeDeparturePeriodsFilter() {
    activeFilters.departurePeriods = [];
    document.querySelectorAll('.departure-period').forEach(cb => cb.checked = false);
    applyAllFilters();
}

function removeArrivalPeriodsFilter() {
    activeFilters.arrivalPeriods = [];
    document.querySelectorAll('.arrival-period').forEach(cb => cb.checked = false);
    applyAllFilters();
}

function removePriceFilter() {
    activeFilters.priceMin = priceRange.min;
    activeFilters.priceMax = priceRange.max;

    const minSlider = document.getElementById('priceMinSlider');
    const maxSlider = document.getElementById('priceMaxSlider');

    if (minSlider) minSlider.value = priceRange.min;
    if (maxSlider) maxSlider.value = priceRange.max;

    const minDisplay = document.getElementById('priceMinDisplay');
    const maxDisplay = document.getElementById('priceMaxDisplay');
    if (minDisplay) minDisplay.textContent = `${priceRange.min}€`;
    if (maxDisplay) maxDisplay.textContent = `${priceRange.max}€`;

    applyAllFilters();
}

// ==========================================
// RESET DE TOUS LES FILTRES
// ==========================================

function resetAllFilters() {
    activeFilters = {
        airlines: [],
        flightType: 'all',
        maxStops: null,
        departurePeriods: [],
        arrivalPeriods: [],
        priceMin: priceRange.min,
        priceMax: priceRange.max
    };

    document.querySelectorAll('.airline-checkbox').forEach(cb => cb.checked = false);

    const flightTypeSelect = document.getElementById('flightTypeSelect');
    if (flightTypeSelect) flightTypeSelect.value = 'all';

    const maxStopsSelect = document.getElementById('maxStopsSelect');
    if (maxStopsSelect) maxStopsSelect.value = 'all';

    document.querySelectorAll('.departure-period, .arrival-period').forEach(cb => cb.checked = false);

    const minSlider = document.getElementById('priceMinSlider');
    const maxSlider = document.getElementById('priceMaxSlider');
    if (minSlider) minSlider.value = priceRange.min;
    if (maxSlider) maxSlider.value = priceRange.max;

    const minDisplay = document.getElementById('priceMinDisplay');
    const maxDisplay = document.getElementById('priceMaxDisplay');
    if (minDisplay) minDisplay.textContent = `${priceRange.min}€`;
    if (maxDisplay) maxDisplay.textContent = `${priceRange.max}€`;

    applyAllFilters();
}



function updatePriceRange(flights) {
    if (flights.length === 0) return;

    const prices = flights.map(f => f.totalPrice || 0).filter(p => p > 0);

    if (prices.length === 0) return;

    const minPrice = Math.floor(Math.min(...prices));
    const maxPrice = Math.ceil(Math.max(...prices));

    priceRange = { min: minPrice, max: maxPrice };

    const minSlider = document.getElementById('priceMinSlider');
    const maxSlider = document.getElementById('priceMaxSlider');
    const minDisplay = document.getElementById('priceMinDisplay');
    const maxDisplay = document.getElementById('priceMaxDisplay');

    if (minSlider) {
        minSlider.min = minPrice;
        minSlider.max = maxPrice;
        minSlider.value = minPrice;
    }

    if (maxSlider) {
        maxSlider.min = minPrice;
        maxSlider.max = maxPrice;
        maxSlider.value = maxPrice;
    }

    if (minDisplay) minDisplay.textContent = `${minPrice}€`;
    if (maxDisplay) maxDisplay.textContent = `${maxPrice}€`;

    activeFilters.priceMin = minPrice;
    activeFilters.priceMax = maxPrice;

    const minLabel = document.querySelector('.price-range-min');
    const maxLabel = document.querySelector('.price-range-max');
    if (minLabel) minLabel.textContent = `${minPrice}€`;
    if (maxLabel) maxLabel.textContent = `${maxPrice}€`;
}