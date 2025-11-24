// Add property page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const addPropertyForm = document.getElementById('addPropertyForm');
    
    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitProperty();
        });
    }
});

async function submitProperty() {
    // Map form fields to the Property schema
    const address = document.getElementById('propAddress').value;
    const city = document.getElementById('propCity').value;
    const state = document.getElementById('propState').value;
    const zip = document.getElementById('propZip').value;

    const propType = document.getElementById('propType').value;
    const rawStatus = document.getElementById('propStatus').value;
    // Normalize status -> availability values used by schema
    let availability = 'Available';
    if (rawStatus === 'Sold') availability = 'Sold';
    else if (rawStatus === 'For Rent') availability = 'Available';
    else if (rawStatus === 'For Sale') availability = 'Available';

    const propertyData = {
        title: document.getElementById('propTitle').value,
        description: document.getElementById('propDescription').value,
        type: propType,
        price: parseFloat(document.getElementById('propPrice').value),
        availability,
        address: address,
        city: city,
        state: state,
        zipCode: zip,
        location: city || address || '',
        bedrooms: parseInt(document.getElementById('propBedrooms').value) || 0,
        bathrooms: parseFloat(document.getElementById('propBathrooms').value) || 0,
        area: parseInt(document.getElementById('propArea').value) || 0,
        parking: document.getElementById('propParking').value ? parseInt(document.getElementById('propParking').value) : 0,
        yearBuilt: document.getElementById('propYearBuilt').value ? parseInt(document.getElementById('propYearBuilt').value) : undefined,
        amenities: document.getElementById('propFeatures').value 
            ? document.getElementById('propFeatures').value.split(',').map(f => f.trim()).filter(f => f)
            : [],
        images: document.getElementById('propImages').value 
            ? document.getElementById('propImages').value.split('\n').map(url => url.trim()).filter(url => url)
            : []
    };
    
    try {
        // POST to server route mounted at /property
        const response = await fetch('/property', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyData)
        });
        
        if (response.ok) {
            const property = await response.json();
            showMessage(document.getElementById('propertyFormMessage'), 'Property added successfully!', 'success');
            document.getElementById('addPropertyForm').reset();
            
            // Redirect to property details after 2 seconds
            setTimeout(() => {
                window.location.href = `/property/${property._id}`;
            }, 2000);
        } else {
            const error = await response.json();
            showMessage(document.getElementById('propertyFormMessage'), error.error || 'Error adding property. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error adding property:', error);
        showMessage(document.getElementById('propertyFormMessage'), 'Error adding property. Please try again.', 'error');
    }
}

