/**
 * UI Controller Module
 * Responsible for managing UI state and interactions
 */

class UIController {
    constructor() {
        this.themeToggleBtn = null;
        this.propertyModal = null;
        this.helpModal = null;
        this.toggleResultsBtn = null;
        this.resultsSection = null;
        this.isDarkMode = false;
        this.currentResults = [];
    }

    /**
     * Initialize UI controller
     */
    init(config) {
        // Get UI elements
        this.themeToggleBtn = document.getElementById('theme-toggle-btn');
        this.propertyModal = document.getElementById('property-modal');
        this.helpModal = document.getElementById('help-modal');
        this.toggleResultsBtn = document.getElementById('toggle-results-btn');
        this.resultsSection = document.querySelector('.results-section');
        this.helpBtn = document.getElementById('help-btn');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check for saved theme preference
        this.loadThemePreference();
        
        console.log('UI Controller initialized');
    }

    /**
     * Set up event listeners for UI elements
     */
    setupEventListeners() {
        // Theme toggle
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Toggle results section
        if (this.toggleResultsBtn && this.resultsSection) {
            this.toggleResultsBtn.addEventListener('click', () => {
                this.toggleResultsSection();
            });
        }
        
        // Help button
        if (this.helpBtn && this.helpModal) {
            this.helpBtn.addEventListener('click', () => {
                this.showModal(this.helpModal);
            });
        }
        
        // Close modals
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    this.hideModal(modal);
                }
            });
        });
        
        // Close modal when clicking outside content
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                this.hideModal(event.target);
            }
        });
    }

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-theme', this.isDarkMode);
        
        // Update button text and icon
        if (this.themeToggleBtn) {
            const icon = this.themeToggleBtn.querySelector('i');
            const text = this.themeToggleBtn.querySelector('span');
            
            if (this.isDarkMode) {
                icon.className = 'fas fa-sun';
                text.textContent = 'Light Mode';
            } else {
                icon.className = 'fas fa-moon';
                text.textContent = 'Dark Mode';
            }
        }
        
        // Save preference
        this.saveThemePreference();
    }

    /**
     * Save theme preference to local storage
     */
    saveThemePreference() {
        localStorage.setItem('darkMode', this.isDarkMode);
    }

    /**
     * Load theme preference from local storage
     */
    loadThemePreference() {
        const savedPreference = localStorage.getItem('darkMode');
        
        if (savedPreference !== null) {
            this.isDarkMode = savedPreference === 'true';
            
            // Apply theme
            document.body.classList.toggle('dark-theme', this.isDarkMode);
            
            // Update button
            if (this.themeToggleBtn) {
                const icon = this.themeToggleBtn.querySelector('i');
                const text = this.themeToggleBtn.querySelector('span');
                
                if (this.isDarkMode) {
                    icon.className = 'fas fa-sun';
                    text.textContent = 'Light Mode';
                }
            }
        }
    }

    /**
     * Toggle results section visibility
     */
    toggleResultsSection() {
        if (!this.resultsSection || !this.toggleResultsBtn) return;
        
        const isVisible = !this.resultsSection.classList.contains('hidden');
        
        if (isVisible) {
            this.resultsSection.classList.add('hidden');
            this.toggleResultsBtn.textContent = 'Show Results';
        } else {
            this.resultsSection.classList.remove('hidden');
            this.toggleResultsBtn.textContent = 'Hide Results';
        }
    }

    /**
     * Show property details in modal
     * @param {Object} property - Property object
     */
    showPropertyDetails(property) {
        if (!this.propertyModal) return;
        
        const detailsContainer = document.getElementById('property-details');
        if (!detailsContainer) return;
        
        // Format amenities
        const amenitiesList = property.amenities && property.amenities.length > 0
            ? `<ul>${property.amenities.map(a => `<li>${a}</li>`).join('')}</ul>`
            : '<p>No amenities listed</p>';
        
        // Format nearby places
        const nearbyPlacesList = property.nearbyPlaces && property.nearbyPlaces.length > 0
            ? `<ul>${property.nearbyPlaces.map(p => `<li>${p}</li>`).join('')}</ul>`
            : '<p>No nearby places listed</p>';
        
        // Create content
        detailsContainer.innerHTML = `
            <div class="property-details-header">
                <h2>${property.bhk} BHK ${property.propertyType}</h2>
                <div class="property-rent">₹${property.rent.toLocaleString()}/month</div>
            </div>
            
            <div class="property-location">
                <h3>${property.buildingName || ''}</h3>
                <p>${property.address || property.locality}</p>
            </div>
            
            <div class="property-specs">
                <div class="spec-item">
                    <span class="spec-label">Area</span>
                    <span class="spec-value">${property.area} sq.ft</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Furnishing</span>
                    <span class="spec-value">${property.furnishingStatus}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Deposit</span>
                    <span class="spec-value">₹${property.deposit.toLocaleString()}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Maintenance</span>
                    <span class="spec-value">₹${property.maintenanceCharges.toLocaleString()}/month</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Available From</span>
                    <span class="spec-value">${property.availableFrom || 'Immediate'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Pets Allowed</span>
                    <span class="spec-value">${property.petsAllowed ? 'Yes' : 'No'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Property Age</span>
                    <span class="spec-value">${property.propertyAge} years</span>
                </div>
            </div>
            
            <div class="property-description">
                <h3>Description</h3>
                <p>${property.description || 'No description available'}</p>
            </div>
            
            <div class="property-amenities">
                <h3>Amenities</h3>
                ${amenitiesList}
            </div>
            
            <div class="property-nearby">
                <h3>Nearby Places</h3>
                ${nearbyPlacesList}
            </div>
            
            <div class="property-contact">
                <h3>Contact Information</h3>
                <p><strong>Owner:</strong> ${property.ownerName}</p>
                <p><strong>Contact:</strong> ${property.ownerContact}</p>
                <p><strong>Last Updated:</strong> ${property.lastUpdated}</p>
            </div>
        `;
        
        // Show modal
        this.showModal(this.propertyModal);
    }

    /**
     * Show modal
     * @param {HTMLElement} modal - Modal element
     */
    showModal(modal) {
        if (!modal) return;
        modal.style.display = 'block';
        
        // Add class for animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    /**
     * Update results with filtered properties
     * @param {Array} properties - Array of filtered property objects
     * @param {Object} filterCriteria - Applied filter criteria
     */
    updateResults(properties, filterCriteria) {
        console.log('UIController.updateResults called with', properties.length, 'properties');
        
        // Store current results for export
        this.currentResults = properties;
        
        // Try to find the resultsTable instance in different scopes
        const tableInstance = window.resultsTable || resultsTable || (typeof ResultsTable !== 'undefined' ? new ResultsTable() : null);
        
        // Update results table if it exists
        if (tableInstance) {
            console.log('Calling resultsTable.updateTable');
            tableInstance.updateTable(properties);
        } else {
            console.error('resultsTable is not defined! Make sure results-table.js is loaded properly.');
            
            // Direct approach as fallback - try to get the table and update it directly
            try {
                const tableBody = document.getElementById('results-body');
                const resultCount = document.getElementById('result-count');
                
                if (tableBody && resultCount) {
                    console.log('Using direct DOM manipulation as fallback');
                    resultCount.textContent = `(${properties.length} properties)`;
                    tableBody.innerHTML = '';
                    
                    properties.forEach(property => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${property.propertyType || 'N/A'}</td>
                            <td>${property.bhk || 'N/A'}</td>
                            <td>${property.locality || 'N/A'}</td>
                            <td>${property.buildingName || '-'}</td>
                            <td>${property.area || 'N/A'}</td>
                            <td>₹${property.rent ? property.rent.toLocaleString() : 'N/A'}</td>
                            <td>${property.furnishingStatus || 'N/A'}</td>
                            <td>
                                <button class="view-details-btn" data-property-id="${property.propertyId}">
                                    View Details
                                </button>
                            </td>
                        `;
                        
                        // Add click event for view details button
                        const viewDetailsBtn = row.querySelector('.view-details-btn');
                        if (viewDetailsBtn) {
                            viewDetailsBtn.addEventListener('click', () => {
                                const property = this.currentResults.find(p => p.propertyId == viewDetailsBtn.dataset.propertyId);
                                if (property) {
                                    this.showPropertyDetails(property);
                                }
                            });
                        }
                        
                        tableBody.appendChild(row);
                    });
                }
            } catch (error) {
                console.error('Failed to update table with fallback method:', error);
            }
        }
        
        // Make sure results section is visible
        if (this.resultsSection) {
            console.log('Showing results section');
            this.resultsSection.classList.remove('hidden');
            if (this.toggleResultsBtn) {
                this.toggleResultsBtn.textContent = 'Hide Results';
            }
        } else {
            console.error('Results section element not found!');
        }
        
        // Create filter summary
        let filterSummary = '';
        if (filterCriteria) {
            if (filterCriteria.propertyType) {
                filterSummary += `${filterCriteria.propertyType} `;
            }
            if (filterCriteria.bhk) {
                filterSummary += `${filterCriteria.bhk}BHK `;
            }
            if (filterCriteria.locality) {
                filterSummary += `in ${filterCriteria.locality} `;
            }
            if (filterCriteria.minRent || filterCriteria.maxRent) {
                filterSummary += 'with rent ';
                if (filterCriteria.minRent) {
                    filterSummary += `from ₹${filterCriteria.minRent} `;
                }
                if (filterCriteria.maxRent) {
                    filterSummary += `up to ₹${filterCriteria.maxRent} `;
                }
            }
            if (filterCriteria.furnishingStatus) {
                filterSummary += `(${filterCriteria.furnishingStatus}) `;
            }
            if (filterCriteria.petsAllowed) {
                filterSummary += '(Pet-friendly) ';
            }
        }
        
        // Show filter summary in chat if available
        if (filterSummary && window.chatInterface) {
            const resultMessage = `I found ${properties.length} ${filterSummary}properties for you.`;
            chatInterface.addAssistantMessage(resultMessage);
        }
    }

    /**
     * Get current results
     * @returns {Array} - Array of current filtered property objects
     */
    getCurrentResults() {
        return this.currentResults || [];
    }

    /**
     * Check if speech is enabled
     * @returns {boolean} - True if speech is enabled
     */
    isSpeechEnabled() {
        // This could be expanded to check user preferences
        // For now, just return false to avoid speech by default
        return false;
    }

    /**
     * Hide modal
     * @param {HTMLElement} modal - Modal element
     */
    hideModal(modal) {
        if (!modal) return;
        modal.classList.remove('show');
        
        // Wait for animation to complete
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Create and export a singleton instance
const uiController = new UIController();