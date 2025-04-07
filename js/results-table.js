/**
 * Results Table Module
 * Responsible for displaying and managing the property results table
 */

class ResultsTable {
    constructor() {
        this.tableBody = null;
        this.resultCount = null;
        this.properties = [];
        this.onViewDetailsCallback = null;
        this.sortField = 'Rent';
        this.sortDirection = 'asc';
    }

    /**
     * Initialize the results table
     * @param {Object} config - Configuration object
     * @param {string} config.tableBodyId - ID of the table body element
     * @param {string} config.resultCountId - ID of the result count element
     * @param {Function} config.onViewDetails - Callback when view details button is clicked
     */
    init(config) {
        console.log('ResultsTable.init called with config:', config);
        
        this.tableBody = document.getElementById(config.tableBodyId);
        console.log('Table body element found:', this.tableBody);
        
        this.resultCount = document.getElementById(config.resultCountId);
        console.log('Result count element found:', this.resultCount);
        
        this.onViewDetailsCallback = config.onViewDetails;
        
        // Set up sort headers
        this.setupSortHeaders();
        
        console.log('Results Table initialized');
    }

    /**
     * Set up sort headers
     */
    setupSortHeaders() {
        const headers = document.querySelectorAll('th[data-sort]');
        console.log('Found sort headers:', headers.length);
        
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const field = header.getAttribute('data-sort');
                this.sortTable(field);
            });
            
            // Add sort indicator
            const indicator = document.createElement('span');
            indicator.className = 'sort-indicator';
            header.appendChild(indicator);
        });
    }

    /**
     * Update table with properties
     * @param {Array} properties - Array of property objects
     */
    updateTable(properties) {
        console.log('ResultsTable.updateTable called with', properties.length, 'properties');
        
        // Safety check for properties
        if (!properties || !Array.isArray(properties)) {
            console.error('Properties is not an array:', properties);
            return;
        }
        
        this.properties = properties;
        
        // Update result count
        if (this.resultCount) {
            console.log('Updating result count');
            this.resultCount.textContent = `(${properties.length} properties)`;
        } else {
            console.error('Result count element not found!');
        }
        
        // Check if table body exists
        if (!this.tableBody) {
            console.error('Table body element not found! Trying to get it again...');
            this.tableBody = document.getElementById('results-body');
            
            if (!this.tableBody) {
                console.error('Still cannot find table body element!');
                return;
            }
        }
        
        // Clear table
        console.log('Clearing table body');
        this.tableBody.innerHTML = '';
        
        // Sort properties
        this.sortProperties();
        
        // Add rows
        console.log('Adding table rows');
        this.addTableRows();
    }

    /**
     * Add table rows for properties
     */
    addTableRows() {
        if (!this.tableBody) {
            console.error('Table body is null, cannot add rows');
            return;
        }
        
        console.log('Adding', this.properties.length, 'rows to table');
        
        this.properties.forEach((property, index) => {
            try {
                const row = document.createElement('tr');
                
                // Create cells
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
                        if (this.onViewDetailsCallback) {
                            this.onViewDetailsCallback(property.propertyId);
                        }
                    });
                }
                
                this.tableBody.appendChild(row);
            } catch (error) {
                console.error(`Error adding row for property #${index}:`, error, property);
            }
        });
        
        console.log('Table rows added successfully');
    }

    /**
     * Sort table by field
     * @param {string} field - Field to sort by
     */
    sortTable(field) {
        console.log('Sorting table by', field);
        
        // Toggle direction if same field
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        
        // Update sort indicators
        this.updateSortIndicators();
        
        // Sort properties
        this.sortProperties();
        
        // Redraw table
        if (this.tableBody) {
            this.tableBody.innerHTML = '';
            this.addTableRows();
        } else {
            console.error('Table body not found when trying to redraw table');
        }
    }

    /**
     * Sort properties based on current sort field and direction
     */
    sortProperties() {
        const field = this.sortField;
        const direction = this.sortDirection;
        
        console.log(`Sorting properties by ${field} (${direction})`);
        
        try {
            this.properties.sort((a, b) => {
                let valueA, valueB;
                
                // Get values based on field
                switch (field) {
                    case 'PropertyType':
                        valueA = a.propertyType || '';
                        valueB = b.propertyType || '';
                        break;
                    case 'BHK':
                        valueA = a.bhk || 0;
                        valueB = b.bhk || 0;
                        break;
                    case 'Locality':
                        valueA = a.locality || '';
                        valueB = b.locality || '';
                        break;
                    case 'BuildingName':
                        valueA = a.buildingName || '';
                        valueB = b.buildingName || '';
                        break;
                    case 'Area':
                        valueA = a.area || 0;
                        valueB = b.area || 0;
                        break;
                    case 'Rent':
                        valueA = a.rent || 0;
                        valueB = b.rent || 0;
                        break;
                    case 'FurnishingStatus':
                        valueA = a.furnishingStatus || '';
                        valueB = b.furnishingStatus || '';
                        break;
                    default:
                        valueA = a.rent || 0;
                        valueB = b.rent || 0;
                }
                
                // Compare values
                if (typeof valueA === 'string' && typeof valueB === 'string') {
                    return direction === 'asc' 
                        ? valueA.localeCompare(valueB) 
                        : valueB.localeCompare(valueA);
                } else {
                    return direction === 'asc' 
                        ? valueA - valueB 
                        : valueB - valueA;
                }
            });
        } catch (error) {
            console.error('Error sorting properties:', error);
        }
    }

    /**
     * Update sort indicators in table headers
     */
    updateSortIndicators() {
        const headers = document.querySelectorAll('th[data-sort]');
        
        headers.forEach(header => {
            const field = header.getAttribute('data-sort');
            const indicator = header.querySelector('.sort-indicator');
            
            if (indicator) {
                if (field === this.sortField) {
                    indicator.textContent = this.sortDirection === 'asc' ? ' ↑' : ' ↓';
                    indicator.style.opacity = '1';
                } else {
                    indicator.textContent = '';
                    indicator.style.opacity = '0';
                }
            }
        });
    }

    /**
     * Get current properties
     * @returns {Array} - Array of property objects
     */
    getProperties() {
        return this.properties;
    }

    /**
     * Set callback for view details button
     * @param {Function} callback - Function to call when view details button is clicked
     */
    setOnViewDetailsCallback(callback) {
        this.onViewDetailsCallback = callback;
    }
}

const resultsTable = new ResultsTable();

// Make it available globally
window.resultsTable = resultsTable;