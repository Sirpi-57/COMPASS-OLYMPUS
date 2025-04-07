/**
 * Filter Processor Module
 * Responsible for filtering property data based on criteria
 */

class FilterProcessor {
    constructor() {
        this.properties = [];
    }

    /**
     * Set the properties data to filter
     * @param {Array} properties - Array of property objects
     */
    setProperties(properties) {
        this.properties = properties;
    }

    /**
     * Apply filter criteria to properties
     * @param {Object} criteria - Filter criteria object
     * @returns {Array} - Filtered properties
     */
    applyFilters(criteria) {
        if (!this.properties || this.properties.length === 0) {
            console.error('No properties data available for filtering');
            return [];
        }

        let filteredProperties = [...this.properties];

        // Filter by locality
        if (criteria.locality) {
            // Convert to array if it's a string
            const localities = Array.isArray(criteria.locality) 
                ? criteria.locality 
                : [criteria.locality];
                
            filteredProperties = filteredProperties.filter(property => {
                return localities.some(loc => 
                    property.locality.toLowerCase().includes(loc.toLowerCase()) ||
                    property.address.toLowerCase().includes(loc.toLowerCase())
                );
            });
        }

        // Filter by BHK - support both array and single value
        if (criteria.bhk) {
            if (Array.isArray(criteria.bhk)) {
                // If it's an array, use includes
                filteredProperties = filteredProperties.filter(property => 
                    criteria.bhk.includes(property.bhk)
                );
            } else {
                // If it's a single value, use equality
                filteredProperties = filteredProperties.filter(property => 
                    property.bhk === criteria.bhk
                );
            }
        }

        // Filter by rent range
        if (criteria.minRent) {
            filteredProperties = filteredProperties.filter(property => 
                property.rent >= criteria.minRent
            );
        }
        if (criteria.maxRent) {
            filteredProperties = filteredProperties.filter(property => 
                property.rent <= criteria.maxRent
            );
        }

        // Filter by property type
        if (criteria.propertyType) {
            filteredProperties = filteredProperties.filter(property => 
                property.propertyType.toLowerCase().includes(criteria.propertyType.toLowerCase())
            );
        }

        // Filter by furnishing status
        if (criteria.furnishingStatus) {
            filteredProperties = filteredProperties.filter(property => 
                property.furnishingStatus.toLowerCase().includes(criteria.furnishingStatus.toLowerCase())
            );
        }

        // Filter by building name
        if (criteria.buildingName) {
            filteredProperties = filteredProperties.filter(property => 
                property.buildingName.toLowerCase().includes(criteria.buildingName.toLowerCase())
            );
        }

        // Filter by pets allowed
        if (criteria.petsAllowed !== undefined && criteria.petsAllowed !== null) {
            filteredProperties = filteredProperties.filter(property => 
                property.petsAllowed === criteria.petsAllowed
            );
        }

        // Filter by amenities
        if (criteria.amenities && criteria.amenities.length > 0) {
            filteredProperties = filteredProperties.filter(property => {
                return criteria.amenities.every(amenity => {
                    // Normalize amenity names for comparison
                    const normalizedAmenity = amenity.toLowerCase();
                    const propertyAmenities = property.amenities.map(a => a.toLowerCase());
                    
                    // Handle special cases
                    if (normalizedAmenity === 'pool' || normalizedAmenity === 'swimming pool') {
                        return propertyAmenities.some(a => a.includes('pool') || a.includes('swimming'));
                    }
                    if (normalizedAmenity === 'gym' || normalizedAmenity === 'fitness') {
                        return propertyAmenities.some(a => a.includes('gym') || a.includes('fitness'));
                    }
                    if (normalizedAmenity === 'elevator' || normalizedAmenity === 'lift') {
                        return propertyAmenities.some(a => a.includes('elevator') || a.includes('lift'));
                    }
                    
                    // Default case
                    return propertyAmenities.some(a => a.includes(normalizedAmenity));
                });
            });
        }

        // Filter by nearby requirements
        if (criteria.nearbyRequirement) {
            filteredProperties = filteredProperties.filter(property => {
                const nearbyPlaces = property.nearbyPlaces.map(place => place.toLowerCase());
                const requirement = criteria.nearbyRequirement.toLowerCase();
                
                // Handle special cases
                if (requirement === 'metro station') {
                    return nearbyPlaces.some(place => place.includes('metro') || place.includes('station'));
                }
                
                // Default case
                return nearbyPlaces.some(place => place.includes(requirement));
            });
        }

        // Sort results if specified
        if (criteria.sortBy) {
            filteredProperties = this.sortProperties(filteredProperties, criteria.sortBy);
        } else {
            // Default sort by rent
            filteredProperties = this.sortProperties(filteredProperties, 'rent');
        }

        return filteredProperties;
    }

    /**
     * Sort properties based on sort criteria
     * @param {Array} properties - Properties to sort
     * @param {string} sortBy - Sort criteria
     * @returns {Array} - Sorted properties
     */
    sortProperties(properties, sortBy) {
        const sortedProperties = [...properties];
        
        switch (sortBy.toLowerCase()) {
            case 'rent':
                sortedProperties.sort((a, b) => a.rent - b.rent);
                break;
            case 'area':
                sortedProperties.sort((a, b) => b.area - a.area);
                break;
            case 'bhk':
                sortedProperties.sort((a, b) => a.bhk - b.bhk);
                break;
            case 'lastupdated':
                sortedProperties.sort((a, b) => {
                    const dateA = new Date(a.lastUpdated);
                    const dateB = new Date(b.lastUpdated);
                    return dateB - dateA; // Most recent first
                });
                break;
            default:
                // Default sort by rent
                sortedProperties.sort((a, b) => a.rent - b.rent);
        }
        
        return sortedProperties;
    }

    /**
     * Search properties by text query
     * @param {string} query - Search query
     * @returns {Array} - Matching properties
     */
    searchByText(query) {
        if (!query || query.trim() === '') {
            // Return a subset of properties instead of all to avoid overwhelming the map
            return this.properties.slice(0, Math.min(20, this.properties.length));
        }
        
        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        
        const matchedProperties = this.properties.filter(property => {
            const searchableText = [
                property.buildingName || '',
                property.locality || '',
                property.address || '',
                property.description || '',
                property.propertyType || '',
                `${property.bhk} BHK`,
                ...(property.amenities || []),
                ...(property.nearbyPlaces || [])
            ].join(' ').toLowerCase();
            
            // Count how many search terms match
            const matchCount = searchTerms.filter(term => searchableText.includes(term)).length;
            
            // Require at least one match, but prefer more matches
            return matchCount > 0;
        });
        
        // Sort by relevance (number of matching terms)
        matchedProperties.sort((a, b) => {
            const aText = [
                a.buildingName || '',
                a.locality || '',
                a.address || '',
                a.description || '',
                a.propertyType || '',
                `${a.bhk} BHK`,
                ...(a.amenities || []),
                ...(a.nearbyPlaces || [])
            ].join(' ').toLowerCase();
            
            const bText = [
                b.buildingName || '',
                b.locality || '',
                b.address || '',
                b.description || '',
                b.propertyType || '',
                `${b.bhk} BHK`,
                ...(b.amenities || []),
                ...(b.nearbyPlaces || [])
            ].join(' ').toLowerCase();
            
            const aCount = searchTerms.filter(term => aText.includes(term)).length;
            const bCount = searchTerms.filter(term => bText.includes(term)).length;
            
            return bCount - aCount; // Higher match count first
        });
        
        // Limit the number of properties to avoid overwhelming the map
        return matchedProperties.slice(0, Math.min(50, matchedProperties.length));
    }

    /**
     * Get unique values for a specific property field
     * @param {Array} properties - Properties to analyze
     * @param {string} field - Field name to get unique values for
     * @returns {Array} - Array of unique values
     */
    getUniqueValues(properties, field) {
        const values = properties.map(p => p[field]);
        return [...new Set(values)].filter(Boolean).sort();
    }

    /**
     * Get min and max values for a numeric field
     * @param {Array} properties - Properties to analyze
     * @param {string} field - Field name to get range for
     * @returns {Object} - Object with min and max values
     */
    getValueRange(properties, field) {
        const values = properties.map(p => p[field]).filter(v => typeof v === 'number' && !isNaN(v));
        return {
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }
}

// Create and export a singleton instance
const filterProcessor = new FilterProcessor();