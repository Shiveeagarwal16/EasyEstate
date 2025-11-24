// Home page JavaScript with interactive features

document.addEventListener('DOMContentLoaded', function() {
    // Hero Slider
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    let currentSlide = 0;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // Auto-slide every 5 seconds
    setInterval(nextSlide, 5000);
    
    // Quick Search Form
    const quickSearchForm = document.getElementById('quickSearchForm');
    if (quickSearchForm) {
        quickSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const city = document.getElementById('searchCity').value;
            const type = document.getElementById('searchType').value;
            const price = document.getElementById('searchPrice').value;
            const bedrooms = document.getElementById('searchBedrooms').value;
            
            // Build query string
            const params = new URLSearchParams();
            if (city) params.append('city', city);
            if (type) params.append('propertyType', type);
            if (price) params.append('maxPrice', price);
            if (bedrooms) params.append('bedrooms', bedrooms);
            
            window.location.href = `/listings?${params.toString()}`;
        });
    }
    
    // Load Featured Properties
    loadFeaturedProperties();
    
    // Animate Stats
    animateStats();
});

// Load featured properties from API
async function loadFeaturedProperties() {
    try {
        const response = await fetch('/api/properties');
        const properties = await response.json();
        
        // Get first 6 properties
        const featured = properties.slice(0, 6);
        const container = document.getElementById('featuredProperties');
        
        if (container && featured.length > 0) {
            container.innerHTML = featured.map(property => createPropertyCard(property)).join('');
            
            // Add click handlers
            container.querySelectorAll('.property-card').forEach(card => {
                card.addEventListener('click', function() {
                    const propertyId = this.dataset.propertyId;
                    window.location.href = `/property/${propertyId}`;
                });
            });
        } else if (container) {
            container.innerHTML = '<p>No properties available at the moment.</p>';
        }
    } catch (error) {
        console.error('Error loading featured properties:', error);
    }
}

// Create property card HTML
function createPropertyCard(property) {
    const image = property.images && property.images.length > 0 
        ? property.images[0] 
        : 'https://via.placeholder.com/400x250?text=Property+Image';
    
    return `
        <div class="property-card" data-property-id="${property._id}">
            <img src="${image}" alt="${property.title}" class="property-image" onerror="this.src='https://via.placeholder.com/400x250?text=Property+Image'">
            <div class="property-info">
                <h3 class="property-title">${property.title}</h3>
                <p class="property-location">📍 ${property.location.city || 'N/A'}, ${property.location.state || 'N/A'}</p>
                <div class="property-details">
                    <span>🛏️ ${property.bedrooms} Beds</span>
                    <span>🚿 ${property.bathrooms} Baths</span>
                    <span>📐 ${property.area} sq ft</span>
                </div>
                <div class="property-price">${formatCurrency(property.price)}</div>
                <span class="property-status status-${property.status.toLowerCase().replace(' ', '-')}">${property.status}</span>
            </div>
        </div>
    `;
}

// Animate statistics counter
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateValue(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

