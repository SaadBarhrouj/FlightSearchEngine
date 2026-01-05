/* ===========================================
   FlightSearch Engine - Application JavaScript
   =========================================== */

// API Base URL
const API_BASE_URL = '/api/flights';

let currentSearchParams = null;
let debounceTimer = null;
let allFlights = []; // Stocker tous les vols pour les filtres

// Pagination
let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    initializeDateInputs();
    initializeTripTypeToggle();
    initializeAutocomplete();
    initializeTravelClasses();
    initializePassengerValidation();
    initializeSearchForm();
    initializeSortOptions();
    initializeFilters();
});

// ==========================================
// DATE INPUTS
// ==========================================

function initializeDateInputs() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const departureDateInput = document.getElementById('departureDate');
    const returnDateInput = document.getElementById('returnDate');

    // Set minimum date to today
    departureDateInput.min = formatDate(today);
    returnDateInput.min = formatDate(tomorrow);

    // Set default values
    departureDateInput.value = formatDate(tomorrow);

    const nextWeek = new Date(tomorrow);
    nextWeek.setDate(nextWeek.getDate() + 7);
    returnDateInput.value = formatDate(nextWeek);

    // Update return date minimum when departure date changes
    departureDateInput.addEventListener('change', function () {
        const depDate = new Date(this.value);
        depDate.setDate(depDate.getDate() + 1);
        returnDateInput.min = formatDate(depDate);

        if (new Date(returnDateInput.value) <= new Date(this.value)) {
            returnDateInput.value = formatDate(depDate);
        }
    });
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// ==========================================
// TRIP TYPE TOGGLE
// ==========================================

function initializeTripTypeToggle() {
    const tripTypeInputs = document.querySelectorAll('input[name="tripType"]');
    const returnDateContainer = document.getElementById('returnDateContainer');

    tripTypeInputs.forEach(input => {
        input.addEventListener('change', function () {
            if (this.value === 'oneWay') {
                returnDateContainer.style.display = 'none';
                document.getElementById('returnDate').required = false;
            } else {
                returnDateContainer.style.display = 'block';
                document.getElementById('returnDate').required = true;
            }
        });
    });
}

// ==========================================
// PASSENGER VALIDATION
// ==========================================

function initializePassengerValidation() {
    const adultsSelect = document.getElementById('adults');
    const childrenSelect = document.getElementById('children');
    const infantsSelect = document.getElementById('infants');
    const warningDiv = document.getElementById('passengerWarning');
    const warningText = document.getElementById('passengerWarningText');
    const searchBtn = document.querySelector('.search-btn');

    const MAX_PASSENGERS = 9; // Amadeus API limit (adults + children)
    
    function validatePassengers() {
        const adults = parseInt(adultsSelect.value);
        const children = parseInt(childrenSelect.value);
        const infants = parseInt(infantsSelect.value);
        
        const totalPassengers = adults + children;
        
        // Rule 1: Maximum 9 passengers (adults + children, infants not counted)
        if (totalPassengers > MAX_PASSENGERS) {
            warningDiv.style.display = 'block';
            warningText.textContent = `Maximum ${MAX_PASSENGERS} passagers (adultes + enfants). Actuellement: ${totalPassengers}`;
            searchBtn.disabled = true;
            return false;
        }
        
        // Rule 2: Number of infants cannot exceed number of adults
        if (infants > adults) {
            warningDiv.style.display = 'block';
            warningText.textContent = `Le nombre de bébés (${infants}) ne peut pas dépasser le nombre d'adultes (${adults})`;
            searchBtn.disabled = true;
            return false;
        }
        
        // All validations passed
        warningDiv.style.display = 'none';
        searchBtn.disabled = false;
        return true;
    }
    
    // Add event listeners to all passenger selects
    adultsSelect.addEventListener('change', validatePassengers);
    childrenSelect.addEventListener('change', validatePassengers);
    infantsSelect.addEventListener('change', validatePassengers);
    
    // Initial validation
    validatePassengers();
}

// ==========================================
// AUTOCOMPLETE
// ==========================================

function initializeAutocomplete() {
    setupAutocomplete('origin', 'originDropdown', 'originCode');
    setupAutocomplete('destination', 'destinationDropdown', 'destinationCode');
}

function setupAutocomplete(inputId, dropdownId, codeInputId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    const codeInput = document.getElementById(codeInputId);

    input.addEventListener('input', function () {
        const keyword = this.value.trim();

        clearTimeout(debounceTimer);

        if (keyword.length < 2) {
            dropdown.classList.remove('show');
            return;
        }

        debounceTimer = setTimeout(() => {
            searchAirports(keyword, dropdown, input, codeInput);
        }, 300);
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

async function searchAirports(keyword, dropdown, input, codeInput) {
    try {
        const response = await fetch(`${API_BASE_URL}/airports?keyword=${encodeURIComponent(keyword)}`);

        if (!response.ok) {
            throw new Error('Erreur lors de la recherche');
        }

        const airports = await response.json();

        if (airports.length === 0) {
            dropdown.innerHTML = '<div class="autocomplete-item text-muted">Aucun aéroport trouvé</div>';
        } else {
            dropdown.innerHTML = airports.map(airport => `
                <div class="autocomplete-item" data-code="${airport.iataCode}" data-name="${airport.displayName}">
                    <span class="airport-code">${airport.iataCode}</span>
                    <span class="airport-name ms-2">${airport.cityName} - ${airport.name}</span>
                </div>
            `).join('');

            // Add click handlers
            dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', function () {
                    const code = this.dataset.code;
                    const name = this.dataset.name;
                    input.value = name;
                    codeInput.value = code;
                    dropdown.classList.remove('show');
                });
            });
        }

        dropdown.classList.add('show');

    } catch (error) {
        console.error('Erreur autocomplete:', error);
        dropdown.innerHTML = '<div class="autocomplete-item text-danger">Erreur de chargement</div>';
        dropdown.classList.add('show');
    }
}

// ==========================================
// SEARCH FORM
// ==========================================

function initializeSearchForm() {
    const form = document.getElementById('searchForm');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        await performSearch();
    });
}

async function performSearch() {

    const originCode = document.getElementById('originCode').value;
    const destinationCode = document.getElementById('destinationCode').value;
    const departureDate = document.getElementById('departureDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const adults = document.getElementById('adults').value;
    const children = document.getElementById('children').value;
    const infants = document.getElementById('infants').value;
    const travelClass = document.getElementById('travelClass').value;
    const tripType = document.querySelector('input[name="tripType"]:checked').value;

    // Validation
    if (!originCode) {
        alert('Veuillez sélectionner une ville de départ');
        document.getElementById('origin').focus();
        return;
    }

    if (!destinationCode) {
        alert('Veuillez sélectionner une ville d\'arrivée');
        document.getElementById('destination').focus();
        return;
    }

    // Build search params
    currentSearchParams = {
        origin: originCode,
        destination: destinationCode,
        departureDate: departureDate,
        adults: adults,
        children: children,
        infants: infants,
        travelClass: travelClass,
        sortBy: getCurrentSortBy()
    };

    if (tripType === 'roundTrip' && returnDate) {
        currentSearchParams.returnDate = returnDate;
    }

    // Show results section
    document.getElementById('resultsSection').style.display = 'block';

    // Update search summary
    updateSearchSummary();

    // Perform search
    await fetchFlights();
}

function updateSearchSummary() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const departureDate = new Date(currentSearchParams.departureDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    let summary = `${origin} → ${destination} • ${departureDate}`;

    if (currentSearchParams.returnDate) {
        const returnDate = new Date(currentSearchParams.returnDate).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
        summary += ` • Retour: ${returnDate}`;
    }

    const totalPassengers = parseInt(currentSearchParams.adults) + parseInt(currentSearchParams.children) + parseInt(currentSearchParams.infants);
    summary += ` • ${totalPassengers} passager${totalPassengers > 1 ? 's' : ''}`;

    document.getElementById('searchSummary').textContent = summary;
}

async function fetchFlights() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const flightResults = document.getElementById('flightResults');
    const noResults = document.getElementById('noResults');
    const errorMessage = document.getElementById('errorMessage');
    const resultsSection = document.getElementById('resultsSection');


    loadingSpinner.style.display = 'block';
    flightResults.innerHTML = '';
    noResults.style.display = 'none';
    errorMessage.style.display = 'none';

    resultsSection.classList.add('sort-changing');

    try {
        const params = new URLSearchParams(currentSearchParams);

        const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de la recherche');
        }

        const result = await response.json();

        loadingSpinner.style.display = 'none';

        if (!result.success) {
            throw new Error(result.errorMessage || 'Erreur lors de la recherche');
        }

        if (result.flights.length === 0) {
            noResults.style.display = 'block';
            document.getElementById('resultsCount').textContent = '0';
        } else {
            allFlights = result.flights; // Stocker tous les vols
            document.getElementById('resultsCount').textContent = result.flights.length;
            renderFlights(result.flights);

            // Extraire et afficher les compagnies disponibles
            extractAirlines(result.flights);

            // Extraire et afficher les escales disponibles
            extractAvailableStops(result.flights);

            // Mettre à jour la plage de prix
            updatePriceRange(result.flights);
        }
    } catch (error) {
        console.error('Erreur recherche:', error);
        loadingSpinner.style.display = 'none';
        errorMessage.style.display = 'block';
        document.getElementById('errorText').textContent = error.message;
    } finally {
        setTimeout(() => {
            resultsSection.classList.remove('sort-changing');
        }, 300);
    }
}

// ==========================================
// TRAVEL CLASSES
// ==========================================

async function initializeTravelClasses() {
    try {
        const response = await fetch(`${API_BASE_URL}/classes`);
        if (!response.ok) throw new Error('Failed to fetch travel classes');
        const classes = await response.json();
        const select = document.getElementById('travelClass');
        select.innerHTML = classes.map(cls =>
            `<option value="${cls.code}" ${cls.code === 'ECONOMY' ? 'selected' : ''}>${cls.name}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading travel classes:', error);
        // Fallback options if API fails
        const select = document.getElementById('travelClass');
        select.innerHTML = `
            <option value="ECONOMY" selected>Économique</option>
            <option value="PREMIUM_ECONOMY">Économique Premium</option>
            <option value="BUSINESS">Affaires</option>
            <option value="FIRST">Première</option>
        `;
    }
}

// ==========================================
// RENDER FLIGHTS WITH PAGINATION
// ==========================================

function renderFlights(flights) {
    allFlights = flights;
    currentPage = 1;
    
    // Initialize filters with all flights
    if (typeof extractAirlines === 'function') {
        extractAirlines(flights);
    }
    if (typeof extractAvailableStops === 'function') {
        extractAvailableStops(flights);
    }
    if (typeof updatePriceRange === 'function') {
        updatePriceRange(flights);
    }
    
    renderCurrentPage();
}

function renderCurrentPage() {
    const container = document.getElementById('flightResults');
    
    // Get filtered flights
    let flightsToDisplay = getFilteredFlights();
    
    totalPages = Math.ceil(flightsToDisplay.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageFlights = flightsToDisplay.slice(startIndex, endIndex);
    
    container.innerHTML = pageFlights.map((flight, index) => 
        createFlightCard(flight, startIndex + index)
    ).join('');
    
    // Update results count
    if (typeof updateResultsCount === 'function') {
        updateResultsCount(flightsToDisplay.length);
    }
    
    renderPagination(flightsToDisplay.length);
    scrollToResults();
}

function getFilteredFlights() {
    // If no active filters, return all flights
    if (typeof activeFilters === 'undefined') {
        return allFlights;
    }
    
    return allFlights.filter(flight => {
        // Check airline filter
        if (activeFilters.airlines.length > 0) {
            if (!activeFilters.airlines.includes(flight.mainCarrierCode)) {
                return false;
            }
        }
        
        // Check flight type filter
        if (activeFilters.flightType === 'direct' && !flight.isDirect) {
            return false;
        } else if (activeFilters.flightType === 'stopover' && flight.isDirect) {
            return false;
        }
        
        // Check max stops filter
        if (activeFilters.maxStops !== null && flight.numberOfStops !== activeFilters.maxStops) {
            return false;
        }
        
        // Check departure time periods
        if (activeFilters.departurePeriods.length > 0) {
            const depTime = flight.outboundSegments[0].formattedDepartureTime;
            const matchesPeriod = activeFilters.departurePeriods.some(period => 
                isTimeInPeriod(depTime, period)
            );
            if (!matchesPeriod) {
                return false;
            }
        }
        
        // Check arrival time periods
        if (activeFilters.arrivalPeriods.length > 0) {
            const lastSegment = flight.outboundSegments[flight.outboundSegments.length - 1];
            const arrTime = lastSegment.formattedArrivalTime;
            const matchesPeriod = activeFilters.arrivalPeriods.some(period => 
                isTimeInPeriod(arrTime, period)
            );
            if (!matchesPeriod) {
                return false;
            }
        }
        
        // Check price range
        if (activeFilters.priceMin !== null && flight.price < activeFilters.priceMin) {
            return false;
        }
        if (activeFilters.priceMax !== null && flight.price > activeFilters.priceMax) {
            return false;
        }
        
        return true;
    });
}

function scrollToResults() {
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderPagination(totalFlights) {
    let paginationContainer = document.getElementById('paginationContainer');
    
    if (!paginationContainer) {
        // Create pagination container if it doesn't exist
        const resultsContainer = document.querySelector('.col-lg-8');
        if (!resultsContainer) return;
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'paginationContainer';
        paginationContainer.className = 'pagination-container mt-4';
        resultsContainer.appendChild(paginationContainer);
    }
    
    totalPages = Math.ceil(totalFlights / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<nav aria-label="Flight results pagination"><ul class="pagination justify-content-center">';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
                <i class="bi bi-chevron-left"></i> Précédent
            </a>
        </li>
    `;
    
    // Page numbers
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(1); return false;">1</a>
            </li>
        `;
        if (startPage > 2) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a>
            </li>
        `;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
                Suivant <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `;
    
    paginationHTML += '</ul></nav>';
    
    // Add results info
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalFlights);
    
    paginationHTML += `
        <div class="pagination-info text-center mt-2">
            <small class="text-muted">
                Affichage de ${startItem} à ${endItem} sur ${totalFlights} vols
            </small>
        </div>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    renderCurrentPage();
}

function createFlightCard(flight, index) {
    const outbound = flight.outboundSegments;
    const returnSegments = flight.returnSegments;
    const firstSegment = outbound[0];
    const lastSegment = outbound[outbound.length - 1];
    
    // Data attributes for filtering
    const dataAttrs = `
        data-index="${index}"
        data-price="${flight.price}" 
        data-airline="${flight.mainCarrierCode}" 
        data-stops="${flight.numberOfStops}"
        data-type="${flight.isDirect ? 'direct' : 'stopover'}"
        data-dep-time="${firstSegment.formattedDepartureTime}"
        data-arr-time="${lastSegment.formattedArrivalTime}"
    `.trim();
    
    return `
        <div class="flight-card" ${dataAttrs}>
            <!-- Header -->
            <div class="flight-card-header">
                <div class="airline-info">
                    <img src="https://images.kiwi.com/airlines/64/${flight.mainCarrierCode}.png" 
                         alt="${flight.mainCarrierCode}" 
                         class="airline-logo-img"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="airline-logo" style="display:none;">${flight.mainCarrierCode}</div>
                    <div>
                        <div class="airline-name">${flight.mainCarrierName || flight.mainCarrierCode}</div>
                        <div class="flight-number">${firstSegment.carrierCode} ${firstSegment.flightNumber}</div>
                    </div>
                </div>
                <div class="flight-details">
                    <span class="detail-badge">
                        <i class="bi bi-clock"></i>
                        ${flight.formattedTotalDuration}
                    </span>
                    <span class="detail-badge ${flight.isDirect ? 'text-success' : ''}">
                        <i class="bi bi-geo-alt"></i>
                        ${flight.stopsDescription}
                    </span>
                </div>
            </div>
            
            <!-- Body - Outbound -->
            <div class="flight-card-body">
                ${createFlightTimes(firstSegment, lastSegment, flight)}
                
                ${outbound.length > 1 ? createSegmentsDetails(outbound, 'Aller') : ''}
            </div>
            
            <!-- Return Flight (if exists) -->
            ${returnSegments && returnSegments.length > 0 ? createReturnFlight(returnSegments) : ''}
            
            <!-- Footer -->
            <div class="flight-card-footer">
                <div class="d-flex align-items-center gap-3">
                    <span class="detail-badge">
                        <i class="bi bi-briefcase"></i>
                        ${getTravelClassName(currentSearchParams.travelClass)}
                    </span>
                    ${firstSegment.aircraftType ? `
                        <span class="detail-badge">
                            <i class="bi bi-airplane-engines"></i>
                            ${firstSegment.aircraftType}
                        </span>
                    ` : ''}
                </div>
                <div class="price-block">
                    <div class="price">${flight.formattedPrice}</div>
                </div>
            </div>
        </div>
    `;
}

function createFlightTimes(firstSegment, lastSegment, flight) {
    return `
        <div class="flight-times">
            <div class="time-block">
                <div class="time">${firstSegment.formattedDepartureTime}</div>
                <div class="airport-code">${firstSegment.departureAirportCode}</div>
                <div class="city-name">${firstSegment.departureCityName || ''}</div>
            </div>
            
            <div class="flight-path">
                <div class="duration">${flight.formattedTotalDuration}</div>
                <div class="path-line">
                    <i class="bi bi-airplane plane-icon"></i>
                </div>
                <div class="stops-info ${flight.isDirect ? 'direct' : ''}">
                    ${flight.stopsDescription}
                </div>
            </div>
            
            <div class="time-block">
                <div class="time">${lastSegment.formattedArrivalTime}</div>
                <div class="airport-code">${lastSegment.arrivalAirportCode}</div>
                <div class="city-name">${lastSegment.arrivalCityName || ''}</div>
            </div>
        </div>
    `;
}

function createSegmentsDetails(segments, title) {
    return `
        <div class="segments-section">
            <div class="segment-title">
                <i class="bi bi-arrow-right me-1"></i>${title} - Détails des escales
            </div>
            ${segments.map((segment, index) => `
                <div class="segment-item">
                    <span class="segment-time">${segment.formattedDepartureTime}</span>
                    <span class="segment-airport">${segment.departureAirportCode}</span>
                    <span class="segment-arrow"><i class="bi bi-arrow-right"></i></span>
                    <span class="segment-time">${segment.formattedArrivalTime}</span>
                    <span class="segment-airport">${segment.arrivalAirportCode}</span>
                    <span class="segment-duration">
                        <i class="bi bi-clock me-1"></i>${segment.formattedDuration}
                    </span>
                </div>
            `).join('')}
        </div>
    `;
}

function createReturnFlight(returnSegments) {
    const firstSegment = returnSegments[0];
    const lastSegment = returnSegments[returnSegments.length - 1];
    const totalDuration = calculateTotalDuration(returnSegments);
    const stops = returnSegments.length - 1;
    return `
        <div class="return-flight">
            <div class="flight-card-body">
                <span class="return-label">
                    <i class="bi bi-arrow-left me-1"></i>Vol Retour
                </span>
                <div class="flight-times">
                    <div class="time-block">
                        <div class="time">${firstSegment.formattedDepartureTime}</div>
                        <div class="airport-code">${firstSegment.departureAirportCode}</div>
                        <div class="city-name">${firstSegment.departureCityName || ''}</div>
                    </div>
                    
                    <div class="flight-path">
                        <div class="duration">${totalDuration}</div>
                        <div class="path-line">
                            <i class="bi bi-airplane plane-icon" style="transform: translate(-50%, -50%) rotate(-90deg);"></i>
                        </div>
                        <div class="stops-info ${stops === 0 ? 'direct' : ''}">
                            ${stops === 0 ? 'Direct' : stops + ' escale' + (stops > 1 ? 's' : '')}
                        </div>
                    </div>
                    
                    <div class="time-block">
                        <div class="time">${lastSegment.formattedArrivalTime}</div>
                        <div class="airport-code">${lastSegment.arrivalAirportCode}</div>
                        <div class="city-name">${lastSegment.arrivalCityName || ''}</div>
                    </div>
                </div>
                
                ${returnSegments.length > 1 ? createSegmentsDetails(returnSegments, 'Retour') : ''}
            </div>
        </div>
    `;
}

function calculateTotalDuration(segments) {
    if (segments.length === 0) return '';
    const first = segments[0];
    const last = segments[segments.length - 1];
    if (first.formattedDuration && segments.length === 1) {
        return first.formattedDuration;
    }
    return segments.map(s => s.formattedDuration).join(' + ');
}

function getTravelClassName(code) {
    const classes = {
        'ECONOMY': 'Économique',
        'PREMIUM_ECONOMY': 'Premium Éco',
        'BUSINESS': 'Business',
        'FIRST': 'Première'
    };
    return classes[code] || code;
}