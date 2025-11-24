// Listings page with OOP implementation and JSON data-driven features

// PropertyCard Class - OOP Implementation
class PropertyCard {
    constructor(property) {
        this.property = property;
        this.element = null;
    }
    
    createCard() {
        const image = this.property.images && this.property.images.length > 0 
            ? this.property.images[0] 
            : 'https://via.placeholder.com/400x250?text=Property+Image';
        
        const cardHTML = `
            <div class="property-card" data-property-id="${this.property._id}">
                <img src="${image}" alt="${this.property.title}" class="property-image" onerror="this.src='https://via.placeholder.com/400x250?text=Property+Image'">
                <div class="property-info">
                    <h3 class="property-title">${this.property.title}</h3>
                    <p class="property-location">📍 ${this.property.location.city || 'N/A'}, ${this.property.location.state || 'N/A'}</p>
                    <div class="property-details">
                        <span>🛏️ ${this.property.bedrooms} Beds</span>
                        <span>🚿 ${this.property.bathrooms} Baths</span>
                        <span>📐 ${this.property.area} sq ft</span>
                    </div>
                    <div class="property-price">${formatCurrency(this.property.price)}</div>
                    <span class="property-status status-${this.property.status.toLowerCase().replace(' ', '-')}">${this.property.status}</span>
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHTML;
        this.element = tempDiv.firstElementChild;
        
        // Add click handler
        this.element.addEventListener('click', () => {
            window.location.href = `/property/${this.property._id}`;
        });
        
        return this.element;
    }
    
    getElement() {
        return this.element;
    }
}

// PropertyManager Class - OOP Implementation for managing properties
class PropertyManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.properties = [];
        this.filteredProperties = [];
        this.propertyCards = [];
    }
    
    async loadProperties() {
        try {
            const response = await fetch('/api/properties');
            const data = await response.json();
            this.properties = data;
            this.filteredProperties = [...data];
            this.render();
        } catch (error) {
            console.error('Error loading properties:', error);
            this.container.innerHTML = '<p class="loading-spinner">Error loading properties. Please try again later.</p>';
        }
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.propertyCards = [];
        
        if (this.filteredProperties.length === 0) {
            this.container.innerHTML = '<p class="loading-spinner">No properties found matching your criteria.</p>';
            return;
        }
        
        this.filteredProperties.forEach(property => {
            const card = new PropertyCard(property);
            const cardElement = card.createCard();
            this.propertyCards.push(card);
            this.container.appendChild(cardElement);
        });
    }
    
    filter(filters) {
        this.filteredProperties = this.properties.filter(property => {
            if (filters.city && !property.location.city.toLowerCase().includes(filters.city.toLowerCase())) {
                return false;
            }
            if (filters.propertyType && property.propertyType !== filters.propertyType) {
                return false;
            }
            if (filters.status && property.status !== filters.status) {
                return false;
            }
            if (filters.minPrice && property.price < filters.minPrice) {
                return false;
            }
            if (filters.maxPrice && property.price > filters.maxPrice) {
                return false;
            }
            if (filters.bedrooms && property.bedrooms < filters.bedrooms) {
                return false;
            }
            return true;
        });
        this.render();
    }
    
    search(query) {
        if (!query) {
            this.filteredProperties = [...this.properties];
            this.render();
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        this.filteredProperties = this.properties.filter(property => {
            return property.title.toLowerCase().includes(lowerQuery) ||
                   property.description.toLowerCase().includes(lowerQuery) ||
                   property.location.city.toLowerCase().includes(lowerQuery) ||
                   property.location.address.toLowerCase().includes(lowerQuery);
        });
        this.render();
    }
    
    sort(sortType) {
        switch(sortType) {
            case 'newest':
                this.filteredProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                this.filteredProperties.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'price-low':
                this.filteredProperties.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProperties.sort((a, b) => b.price - a.price);
                break;
        }
        this.render();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const propertyManager = new PropertyManager('propertiesContainer');
    
    // Load properties from JSON API
    propertyManager.loadProperties();
    
    // Filter form
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const filters = {
                city: document.getElementById('filterCity').value,
                propertyType: document.getElementById('filterType').value,
                status: document.getElementById('filterStatus').value,
                minPrice: document.getElementById('filterMinPrice').value ? parseInt(document.getElementById('filterMinPrice').value) : null,
                maxPrice: document.getElementById('filterMaxPrice').value ? parseInt(document.getElementById('filterMaxPrice').value) : null,
                bedrooms: document.getElementById('filterBedrooms').value ? parseInt(document.getElementById('filterBedrooms').value) : null
            };
            propertyManager.filter(filters);
        });
    }
    
    // Reset filters
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            filterForm.reset();
            propertyManager.filteredProperties = [...propertyManager.properties];
            propertyManager.render();
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value;
            propertyManager.search(query);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                propertyManager.search(query);
            }
        });
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            propertyManager.sort(this.value);
        });
    }
    
    // Check URL parameters for initial filters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString()) {
        const filters = {
            city: urlParams.get('city') || '',
            propertyType: urlParams.get('propertyType') || '',
            status: urlParams.get('status') || '',
            minPrice: urlParams.get('minPrice') ? parseInt(urlParams.get('minPrice')) : null,
            maxPrice: urlParams.get('maxPrice') ? parseInt(urlParams.get('maxPrice')) : null,
            bedrooms: urlParams.get('bedrooms') ? parseInt(urlParams.get('bedrooms')) : null
        };
        
        // Set form values
        if (filters.city) document.getElementById('filterCity').value = filters.city;
        if (filters.propertyType) document.getElementById('filterType').value = filters.propertyType;
        if (filters.status) document.getElementById('filterStatus').value = filters.status;
        if (filters.minPrice) document.getElementById('filterMinPrice').value = filters.minPrice;
        if (filters.maxPrice) document.getElementById('filterMaxPrice').value = filters.maxPrice;
        if (filters.bedrooms) document.getElementById('filterBedrooms').value = filters.bedrooms;
        
        // Apply filters after properties load
        setTimeout(() => {
            propertyManager.filter(filters);
        }, 500);
    }
});

