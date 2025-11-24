// Manage properties page with CRUD operations

document.addEventListener('DOMContentLoaded', function() {
    loadPropertiesForManagement();
    
    // Edit modal close
    const editModal = document.getElementById('editPropertyModal');
    const closeModalBtns = document.querySelectorAll('#editPropertyModal .close-modal, #editPropertyModal .close-modal-btn');
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            editModal.style.display = 'none';
        });
    });
    
    // Edit form submission
    const editForm = document.getElementById('editPropertyForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProperty();
        });
    }
});

async function loadPropertiesForManagement() {
    try {
        const response = await fetch('/api/properties');
        const properties = await response.json();
        
        const container = document.getElementById('propertiesManagement');
        if (container) {
            if (properties.length === 0) {
                container.innerHTML = '<p>No properties to manage. <a href="/add-property">Add a property</a></p>';
            } else {
                container.innerHTML = properties.map(property => createManagementItemHTML(property)).join('');
                
                // Add event listeners
                container.querySelectorAll('.btn-edit').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const propertyId = this.dataset.propertyId;
                        openEditModal(propertyId);
                    });
                });
                
                container.querySelectorAll('.btn-delete').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const propertyId = this.dataset.propertyId;
                        if (confirm('Are you sure you want to delete this property?')) {
                            deleteProperty(propertyId);
                        }
                    });
                });
            }
        }
    } catch (error) {
        console.error('Error loading properties:', error);
    }
}

function createManagementItemHTML(property) {
    return `
        <div class="property-management-item">
            <div class="property-management-info">
                <h3>${property.title}</h3>
                <p>${property.location.city || 'N/A'}, ${property.location.state || 'N/A'} - ${formatCurrency(property.price)}</p>
                <p style="color: var(--text-light); font-size: 0.9rem;">${property.propertyType} • ${property.bedrooms} Beds • ${property.bathrooms} Baths</p>
            </div>
            <div class="property-management-actions">
                <button class="btn btn-primary btn-small btn-edit" data-property-id="${property._id}">Edit</button>
                <button class="btn btn-danger btn-small btn-delete" data-property-id="${property._id}">Delete</button>
            </div>
        </div>
    `;
}

async function openEditModal(propertyId) {
    try {
        const response = await fetch(`/api/properties/${propertyId}`);
        const property = await response.json();
        
        const modal = document.getElementById('editPropertyModal');
        const formContent = document.getElementById('editFormContent');
        const propIdInput = document.getElementById('editPropId');
        
        if (modal && formContent && propIdInput) {
            propIdInput.value = property._id;
            
            formContent.innerHTML = `
                <div class="form-group">
                    <label for="editTitle">Property Title *</label>
                    <input type="text" id="editTitle" value="${property.title}" required>
                </div>
                <div class="form-group">
                    <label for="editDescription">Description *</label>
                    <textarea id="editDescription" rows="5" required>${property.description}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editPrice">Price ($) *</label>
                        <input type="number" id="editPrice" value="${property.price}" required>
                    </div>
                    <div class="form-group">
                        <label for="editType">Property Type *</label>
                        <select id="editType" required>
                            <option value="House" ${property.propertyType === 'House' ? 'selected' : ''}>House</option>
                            <option value="Apartment" ${property.propertyType === 'Apartment' ? 'selected' : ''}>Apartment</option>
                            <option value="Condo" ${property.propertyType === 'Condo' ? 'selected' : ''}>Condo</option>
                            <option value="Townhouse" ${property.propertyType === 'Townhouse' ? 'selected' : ''}>Townhouse</option>
                            <option value="Villa" ${property.propertyType === 'Villa' ? 'selected' : ''}>Villa</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editStatus">Status *</label>
                        <select id="editStatus" required>
                            <option value="For Sale" ${property.status === 'For Sale' ? 'selected' : ''}>For Sale</option>
                            <option value="For Rent" ${property.status === 'For Rent' ? 'selected' : ''}>For Rent</option>
                            <option value="Sold" ${property.status === 'Sold' ? 'selected' : ''}>Sold</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editCity">City *</label>
                        <input type="text" id="editCity" value="${property.location.city || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="editState">State *</label>
                        <input type="text" id="editState" value="${property.location.state || ''}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editBedrooms">Bedrooms *</label>
                        <input type="number" id="editBedrooms" value="${property.bedrooms}" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="editBathrooms">Bathrooms *</label>
                        <input type="number" id="editBathrooms" value="${property.bathrooms}" min="1" step="0.5" required>
                    </div>
                    <div class="form-group">
                        <label for="editArea">Area (sq ft) *</label>
                        <input type="number" id="editArea" value="${property.area}" required>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading property for edit:', error);
        alert('Error loading property details');
    }
}

async function updateProperty() {
    const propertyId = document.getElementById('editPropId').value;
    
    const propertyData = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        price: parseFloat(document.getElementById('editPrice').value),
        propertyType: document.getElementById('editType').value,
        status: document.getElementById('editStatus').value,
        location: {
            city: document.getElementById('editCity').value,
            state: document.getElementById('editState').value
        },
        bedrooms: parseInt(document.getElementById('editBedrooms').value),
        bathrooms: parseFloat(document.getElementById('editBathrooms').value),
        area: parseInt(document.getElementById('editArea').value)
    };
    
    try {
        const response = await fetch(`/api/properties/${propertyId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyData)
        });
        
        if (response.ok) {
            showMessage(document.getElementById('editFormMessage'), 'Property updated successfully!', 'success');
            setTimeout(() => {
                document.getElementById('editPropertyModal').style.display = 'none';
                loadPropertiesForManagement();
            }, 1500);
        } else {
            const error = await response.json();
            showMessage(document.getElementById('editFormMessage'), error.error || 'Error updating property.', 'error');
        }
    } catch (error) {
        console.error('Error updating property:', error);
        showMessage(document.getElementById('editFormMessage'), 'Error updating property. Please try again.', 'error');
    }
}

async function deleteProperty(propertyId) {
    try {
        const response = await fetch(`/api/properties/${propertyId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadPropertiesForManagement();
        } else {
            alert('Error deleting property');
        }
    } catch (error) {
        console.error('Error deleting property:', error);
        alert('Error deleting property');
    }
}

