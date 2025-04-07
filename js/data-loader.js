/**
 * Data Loader Module
 * Responsible for loading and processing property data
 */

class DataLoader {
    constructor() {
        this.properties = [];
        this.isLoaded = false;
        this.loadingPromise = null;
        this.dataUrl = null;
    }

    /**
     * Initialize the data loader
     * @param {Object} config - Configuration object
     * @param {string} config.dataUrl - URL of the data file
     */
    init(config) {
        this.dataUrl = config.dataUrl;
        console.log('Data Loader initialized with URL:', this.dataUrl);
    }

    /**
     * Load property data from CSV file
     * @returns {Promise<Array>} - Promise resolving to array of property objects
     */
    loadData() {
        if (this.isLoaded) {
            return Promise.resolve(this.properties);
        }
        
        if (this.loadingPromise) {
            return this.loadingPromise;
        }
        
        this.loadingPromise = new Promise((resolve, reject) => {
            Papa.parse(this.dataUrl, {
                download: true,
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    this.properties = this.processData(results.data);
                    this.isLoaded = true;
                    console.log(`Loaded ${this.properties.length} properties`);
                    resolve(this.properties);
                },
                error: (error) => {
                    console.error('Error loading CSV:', error);
                    reject(error);
                }
            });
        });
        return this.loadingPromise;
    }

    /**
     * Process and clean the raw data from CSV
     * @param {Array} rawData - Raw data from CSV parser
     * @returns {Array} - Processed property data
     */
    processData(rawData) {
        return rawData
            .filter(item => item.PropertyID && item.Latitude && item.Longitude)
            .map(item => {
                // Convert string amenities to array
                const amenities = item.Amenities ? item.Amenities.split(',').map(a => a.trim()) : [];
                
                // Convert string nearby places to array
                const nearbyPlaces = item.NearbyPlaces ? item.NearbyPlaces.split(',').map(p => p.trim()) : [];
                
                // Ensure numeric values are numbers
                const rent = typeof item.Rent === 'number' ? item.Rent : parseInt(item.Rent, 10) || 0;
                const area = typeof item.Area === 'number' ? item.Area : parseInt(item.Area, 10) || 0;
                const bhk = typeof item.BHK === 'number' ? item.BHK : parseInt(item.BHK, 10) || 0;
                const maintenanceCharges = typeof item.MaintenanceCharges === 'number' ? 
                    item.MaintenanceCharges : parseInt(item.MaintenanceCharges, 10) || 0;
                const deposit = typeof item.Deposit === 'number' ? 
                    item.Deposit : parseInt(item.Deposit, 10) || 0;
                const propertyAge = typeof item.PropertyAge === 'number' ? 
                    item.PropertyAge : parseInt(item.PropertyAge, 10) || 0;
                
                // Normalize property type
                const propertyType = item.PropertyType ? item.PropertyType.trim() : 'Apartment';
                
                // Normalize furnishing status
                const furnishingStatus = item.FurnishingStatus ? item.FurnishingStatus.trim() : 'Unfurnished';
                
                // Normalize pets allowed
                const petsAllowed = typeof item.PetsAllowed === 'boolean' ? 
                    item.PetsAllowed : (item.PetsAllowed === 'Yes' || item.PetsAllowed === 'yes' || item.PetsAllowed === 'true');
                
                return {
                    propertyId: item.PropertyID,
                    propertyType,
                    bhk,
                    area,
                    rent,
                    locality: item.Locality || '',
                    buildingName: item.BuildingName || '',
                    address: item.Address || '',
                    latitude: item.Latitude,
                    longitude: item.Longitude,
                    amenities,
                    furnishingStatus,
                    availableFrom: item.AvailableFrom || '',
                    maintenanceCharges,
                    deposit,
                    petsAllowed,
                    ownerName: item.OwnerName || '',
                    ownerContact: item.OwnerContact || '',
                    lastUpdated: item.LastUpdated || '',
                    propertyAge,
                    description: item.Description || '',
                    nearbyPlaces
                };
            });
    }

    /**
     * Get all loaded properties
     * @returns {Array} - Array of property objects
     */
    getAllProperties() {
        return this.properties;
    }

    /**
     * Get property by ID
     * @param {string|number} propertyId - Property ID to find
     * @returns {Object|null} - Property object or null if not found
     */
    getPropertyById(propertyId) {
        return this.properties.find(p => p.propertyId == propertyId) || null;
    }

    /**
     * Get unique values for a specific property field
     * @param {string} field - Field name to get unique values for
     * @returns {Array} - Array of unique values
     */
    getUniqueValues(field) {
        const values = this.properties.map(p => p[field]);
        return [...new Set(values)].filter(Boolean).sort();
    }

    /**
     * Get min and max values for a numeric field
     * @param {string} field - Field name to get range for
     * @returns {Object} - Object with min and max values
     */
    getValueRange(field) {
        const values = this.properties.map(p => p[field]).filter(v => typeof v === 'number' && !isNaN(v));
        return {
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }

    /**
     * Check if data is loaded
     * @returns {boolean} - True if data is loaded
     */
    isDataLoaded() {
        return this.isLoaded;
    }
}

// Create and export a singleton instance
const dataLoader = new DataLoader();
