// Property details page with JSON data-driven content

document.addEventListener('DOMContentLoaded', function() {
    const propertyId = document.getElementById('reviewPropertyId')?.value || 
                      window.location.pathname.split('/').pop();
    
    if (propertyId) {
        loadPropertyDetails(propertyId);
        loadReviews(propertyId);
    }
    
    // Review form submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitReview(propertyId);
        });
    }
});

// Load property details from JSON API
async function loadPropertyDetails(propertyId) {
    try {
        const response = await fetch(`/api/properties/${propertyId}`);
        if (!response.ok) {
            throw new Error('Property not found');
        }
        
        const property = await response.json();
        const container = document.getElementById('propertyDetailsContainer');
        
        if (container) {
            container.innerHTML = createPropertyDetailsHTML(property);
        }
    } catch (error) {
        console.error('Error loading property details:', error);
        const container = document.getElementById('propertyDetailsContainer');
        if (container) {
            container.innerHTML = '<p class="loading-spinner">Error loading property details. Please try again later.</p>';
        }
    }
}

// Create property details HTML
function createPropertyDetailsHTML(property) {
    const images = property.images && property.images.length > 0 
        ? property.images 
        : ['https://via.placeholder.com/800x500?text=Property+Image'];
    
    const imageGallery = images.map(img => 
        `<img src="${img}" alt="${property.title}" onerror="this.src='https://via.placeholder.com/800x500?text=Property+Image'">`
    ).join('');
    
    const features = property.features && property.features.length > 0
        ? property.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')
        : '<p>No features listed</p>';
    
    return `
        <div class="property-details-container">
            <div class="property-details-gallery">
                ${imageGallery}
            </div>
            <div class="property-details-content">
                <div class="property-details-header">
                    <h1>${property.title}</h1>
                    <p class="property-location">📍 ${property.location.address || ''}, ${property.location.city || ''}, ${property.location.state || ''} ${property.location.zipCode || ''}</p>
                    <div class="property-price" style="font-size: 2rem; margin: 1rem 0;">${formatCurrency(property.price)}</div>
                    <span class="property-status status-${property.status.toLowerCase().replace(' ', '-')}">${property.status}</span>
                </div>
                
                <div class="property-details-meta">
                    <div class="meta-item">
                        <strong>Property Type</strong>
                        <span>${property.propertyType}</span>
                    </div>
                    <div class="meta-item">
                        <strong>Bedrooms</strong>
                        <span>${property.bedrooms}</span>
                    </div>
                    <div class="meta-item">
                        <strong>Bathrooms</strong>
                        <span>${property.bathrooms}</span>
                    </div>
                    <div class="meta-item">
                        <strong>Area</strong>
                        <span>${property.area} sq ft</span>
                    </div>
                    ${property.parking ? `
                    <div class="meta-item">
                        <strong>Parking</strong>
                        <span>${property.parking} spaces</span>
                    </div>
                    ` : ''}
                    ${property.yearBuilt ? `
                    <div class="meta-item">
                        <strong>Year Built</strong>
                        <span>${property.yearBuilt}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="property-description">
                    <h2>Description</h2>
                    <p>${property.description}</p>
                </div>
                
                <div class="property-features">
                    <h2>Features</h2>
                    ${features}
                </div>
            </div>
        </div>
    `;
}

// Load reviews from JSON API
async function loadReviews(propertyId) {
    try {
        const response = await fetch(`/api/reviews/property/${propertyId}`);
        const reviews = await response.json();
        
        const container = document.getElementById('reviewsContainer');
        if (container) {
            if (reviews.length === 0) {
                container.innerHTML = '<p>No reviews yet. Be the first to review this property!</p>';
            } else {
                container.innerHTML = reviews.map(review => createReviewHTML(review)).join('');
            }
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Create review HTML
function createReviewHTML(review) {
    const stars = '⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    
    return `
        <div class="review-card">
            <div class="review-header">
                <div>
                    <strong>${review.userName}</strong>
                    <div class="review-rating">${stars}</div>
                </div>
                <span style="color: var(--text-light); font-size: 0.9rem;">${formatDate(review.createdAt)}</span>
            </div>
            <p>${review.comment}</p>
        </div>
    `;
}

// Submit review
async function submitReview(propertyId) {
    const name = document.getElementById('reviewName').value;
    const email = document.getElementById('reviewEmail').value;
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value;
    
    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                propertyId: propertyId,
                userName: name,
                userEmail: email,
                rating: parseInt(rating),
                comment: comment
            })
        });
        
        if (response.ok) {
            const reviewForm = document.getElementById('reviewForm');
            reviewForm.reset();
            showMessage(document.getElementById('contactFormMessage'), 'Review submitted successfully!', 'success');
            loadReviews(propertyId);
        } else {
            showMessage(document.getElementById('contactFormMessage'), 'Error submitting review. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        showMessage(document.getElementById('contactFormMessage'), 'Error submitting review. Please try again.', 'error');
    }
}

