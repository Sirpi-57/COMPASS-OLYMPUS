/**
 * Map Manager Module
 * Responsible for initializing and managing the Google Maps and markers
 */

class MapManager {
    constructor() {
        this.map = null;
        this.markers = {};
        this.markerCluster = null;
        this.infoWindow = null;
        this.directionsService = null;
        this.directionsRenderer = null;
        this.propertyTypeIcons = {
            'Apartment': 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            'Independent House': 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            'Studio Apartment': 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
            'Villa': 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
            'Penthouse': 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        };
        this.defaultLocation = { lat: 13.0827, lng: 80.2707 }; // Chennai coordinates
        this.defaultZoom = 12;
        this.userLocation = null;
    }

    /**
     * Initialize the map
     * @param {string} mapElementId - ID of the HTML element to contain the map
     * @returns {Object} - The initialized map object
     */
    initMap(mapElementId) {
        // Create the map
        this.map = new google.maps.Map(document.getElementById(mapElementId), {
            center: this.defaultLocation,
            zoom: this.defaultZoom,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_RIGHT
            },
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            streetViewControl: true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            fullscreenControl: true,
            fullscreenControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            }
        });

        // Initialize info window for markers
        this.infoWindow = new google.maps.InfoWindow();
        
        // Initialize directions service and renderer
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: false,
            preserveViewport: false,
            polylineOptions: {
                strokeColor: '#4285F4',
                strokeWeight: 5,
                strokeOpacity: 0.7
            }
        });
        this.directionsRenderer.setMap(this.map);
        
        // Add custom controls
        this.addCustomControls();
        
        // Try to get user's location
        this.getUserLocation();

        return this.map;
    }

    /**
     * Add custom controls to the map
     */
    addCustomControls() {
        // Create reset view control
        const resetViewControlDiv = document.createElement('div');
        this.createResetViewControl(resetViewControlDiv);
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(resetViewControlDiv);
    }

    /**
     * Create reset view control
     * @param {HTMLElement} controlDiv - Control container
     */
    createResetViewControl(controlDiv) {
        // Set CSS for the control
        controlDiv.style.backgroundColor = '#fff';
        controlDiv.style.border = '2px solid #fff';
        controlDiv.style.borderRadius = '3px';
        controlDiv.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlDiv.style.cursor = 'pointer';
        controlDiv.style.marginTop = '10px';
        controlDiv.style.marginRight = '10px';
        controlDiv.style.textAlign = 'center';
        controlDiv.title = 'Reset view';
        
        // Set CSS for the control interior
        const controlUI = document.createElement('div');
        controlUI.style.color = 'rgb(25,25,25)';
        controlUI.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlUI.style.fontSize = '16px';
        controlUI.style.lineHeight = '38px';
        controlUI.style.paddingLeft = '5px';
        controlUI.style.paddingRight = '5px';
        controlUI.innerHTML = '<i class="fas fa-home"></i>';
        controlDiv.appendChild(controlUI);
        
        // Setup click event listener
        controlUI.addEventListener('click', () => {
            this.resetView();
        });
    }

    /**
     * Get user's current location
     */
    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('User location obtained:', this.userLocation);
                },
                (error) => {
                    console.error('Error getting user location:', error);
                }
            );
        } else {
            console.warn('Geolocation is not supported by this browser');
        }
    }

    /**
     * Add property markers to the map
     * @param {Array} properties - Array of property objects
     * @param {Function} onMarkerClick - Callback function when marker is clicked
     */
    addPropertyMarkers(properties, onMarkerClick) {
        // Clear existing markers
        this.clearMarkers();
        
        // Clear directions if any
        this.clearDirections();
        
        // Create markers array for clustering
        const markers = [];
        
        // Add new markers
        properties.forEach(property => {
            if (!property.latitude || !property.longitude) return;
            
            const position = {
                lat: parseFloat(property.latitude),
                lng: parseFloat(property.longitude)
            };
            
            const marker = new google.maps.Marker({
                position: position,
                map: this.map,
                icon: this.propertyTypeIcons[property.propertyType] || this.propertyTypeIcons['Apartment'],
                title: `${property.bhk} BHK ${property.propertyType} in ${property.buildingName || property.locality}`,
                propertyId: property.propertyId
            });
            
            // Create info window content
            const infoWindowContent = this.createInfoWindowContent(property);
            
            // Add click event
            marker.addListener('click', () => {
                // Open info window
                this.infoWindow.setContent(infoWindowContent);
                this.infoWindow.open(this.map, marker);
                
                // Call callback
                if (onMarkerClick) {
                    onMarkerClick(property.propertyId);
                }
            });
            
            // Store marker reference
            this.markers[property.propertyId] = marker;
            
            // Add to markers array for clustering
            markers.push(marker);
        });
        
        // Initialize marker clusterer if we have markers
        if (markers.length > 0) {
            this.markerCluster = new MarkerClusterer(this.map, markers, {
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                maxZoom: 15,
                gridSize: 50
            });
            
            // Fit map to markers
            this.fitMapToMarkers();
        }
    }

    /**
     * Create info window content for a property
     * @param {Object} property - Property object
     * @returns {string} - HTML content for info window
     */
    createInfoWindowContent(property) {
        return `
            <div class="marker-popup">
                <div class="popup-property-type">${property.propertyType}</div>
                <div class="popup-property-name">${property.bhk} BHK in ${property.buildingName || property.locality}</div>
                <div class="popup-property-rent">₹${property.rent.toLocaleString()}/month</div>
                <div class="popup-actions">
                    <button class="popup-details-btn" onclick="mapManager.viewPropertyDetails('${property.propertyId}')">View Details</button>
                    <button class="popup-directions-btn" onclick="mapManager.getDirections('${property.propertyId}')">Get Directions</button>
                </div>
            </div>
        `;
    }

    /**
     * View property details
     * @param {string|number} propertyId - ID of the property to view
     */
    viewPropertyDetails(propertyId) {
        // This will be called from the info window
        if (window.handleViewPropertyDetails) {
            window.handleViewPropertyDetails(propertyId);
        }
    }

    /**
     * Get directions to a property
     * @param {string|number} propertyId - ID of the property to get directions to
     */
    getDirections(propertyId) {
        const marker = this.markers[propertyId];
        if (!marker) return;
        
        // Check if we have user location
        if (!this.userLocation) {
            // Try to get user location again
            this.getUserLocation();
            
            // Show message
            alert('Please allow location access to get directions. If you denied permission, please reset it in your browser settings and try again.');
            return;
        }
        
        // Clear existing directions
        this.clearDirections();
        
        // Get directions
        this.directionsService.route(
            {
                origin: this.userLocation,
                destination: marker.getPosition(),
                travelMode: google.maps.TravelMode.DRIVING
            },
            (response, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    // Display directions
                    this.directionsRenderer.setDirections(response);
                    
                    // Hide markers while showing directions
                    this.hideMarkers();
                    
                    // Show directions panel if it exists
                    const directionsPanel = document.getElementById('directions-panel');
                    if (directionsPanel) {
                        directionsPanel.innerHTML = '';
                        directionsPanel.style.display = 'block';
                        this.directionsRenderer.setPanel(directionsPanel);
                    }
                    
                    // Show clear directions button
                    this.showClearDirectionsButton();
                } else {
                    console.error('Directions request failed due to ' + status);
                    alert('Could not calculate directions. Please try again later.');
                }
            }
        );
    }

    /**
     * Show clear directions button
     */
    showClearDirectionsButton() {
        // Create button if it doesn't exist
        let clearBtn = document.getElementById('clear-directions-btn');
        
        if (!clearBtn) {
            clearBtn = document.createElement('button');
            clearBtn.id = 'clear-directions-btn';
            clearBtn.className = 'clear-directions-btn';
            clearBtn.innerHTML = 'Clear Directions';
            clearBtn.addEventListener('click', () => {
                this.clearDirections();
            });
            
            // Add to map
            document.querySelector('.map-container').appendChild(clearBtn);
        }
        
        // Show button
        clearBtn.style.display = 'block';
    }

    /**
     * Clear directions
     */
    clearDirections() {
        // Clear directions renderer
        if (this.directionsRenderer) {
            this.directionsRenderer.setDirections({ routes: [] });
        }
        
        // Hide directions panel if it exists
        const directionsPanel = document.getElementById('directions-panel');
        if (directionsPanel) {
            directionsPanel.style.display = 'none';
            directionsPanel.innerHTML = '';
        }
        
        // Hide clear directions button
        const clearBtn = document.getElementById('clear-directions-btn');
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }
        
        // Show markers again
        this.showMarkers();
    }

    /**
     * Hide all markers
     */
    hideMarkers() {
        Object.values(this.markers).forEach(marker => {
            marker.setVisible(false);
        });
        
        // Hide marker cluster if it exists
        if (this.markerCluster) {
            this.markerCluster.clearMarkers();
        }
    }

    /**
     * Show all markers
     */
    showMarkers() {
        const markers = [];
        
        Object.values(this.markers).forEach(marker => {
            marker.setVisible(true);
            markers.push(marker);
        });
        
        // Recreate marker cluster if we have markers
        if (markers.length > 0 && this.markerCluster) {
            this.markerCluster = new MarkerClusterer(this.map, markers, {
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                maxZoom: 15,
                gridSize: 50
            });
        }
    }

    /**
     * Clear all markers from the map
     */
    clearMarkers() {
        // Clear marker cluster if it exists
        if (this.markerCluster) {
            this.markerCluster.clearMarkers();
        }
        
        // Clear individual markers
        Object.values(this.markers).forEach(marker => {
            marker.setMap(null);
        });
        
        // Reset markers object
        this.markers = {};
    }

    /**
     * Fit the map view to show all markers
     */
    fitMapToMarkers() {
        if (Object.keys(this.markers).length === 0) return;
        
        const bounds = new google.maps.LatLngBounds();
        
        Object.values(this.markers).forEach(marker => {
            bounds.extend(marker.getPosition());
        });
        
        this.map.fitBounds(bounds);
        
        // Don't zoom in too far
        const listener = google.maps.event.addListener(this.map, 'idle', () => {
            if (this.map.getZoom() > 16) {
                this.map.setZoom(16);
            }
            google.maps.event.removeListener(listener);
        });
    }

    /**
     * Focus on a specific marker
     * @param {string|number} propertyId - ID of the property to focus on
     */
    focusOnMarker(propertyId) {
        const marker = this.markers[propertyId];
        if (marker) {
            this.map.setCenter(marker.getPosition());
            this.map.setZoom(16);
            
            // Open info window
            const property = dataLoader.getPropertyById(propertyId);
            if (property) {
                const infoWindowContent = this.createInfoWindowContent(property);
                this.infoWindow.setContent(infoWindowContent);
                this.infoWindow.open(this.map, marker);
            }
        }
    }

    /**
     * Reset the map view to default
     */
    resetView() {
        this.map.setCenter(this.defaultLocation);
        this.map.setZoom(this.defaultZoom);
        
        // Clear directions if any
        this.clearDirections();
        
        // Close info window if open
        this.infoWindow.close();
    }

    /**
     * Add CSS styles for map elements
     */
    addMapStyles() {
        // Check if styles already exist
        if (document.getElementById('map-custom-styles')) {
            return;
        }
        
        // Create style element
        const style = document.createElement('style');
        style.id = 'map-custom-styles';
        
        // Add styles
        style.innerHTML = `
            .marker-popup {
                padding: 10px;
                font-family: 'Roboto', Arial, sans-serif;
            }
            
            .popup-property-type {
                font-size: 12px;
                font-weight: bold;
                color: #4285F4;
                text-transform: uppercase;
                margin-bottom: 5px;
            }
            
            .popup-property-name {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .popup-property-rent {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #0F9D58;
            }
            
            .popup-actions {
                display: flex;
                gap: 5px;
            }
            
            .popup-details-btn, .popup-directions-btn {
                padding: 5px 10px;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
                transition: background-color 0.3s;
            }
            
            .popup-details-btn {
                background-color: #4285F4;
                color: white;
            }
            
            .popup-directions-btn {
                background-color: #0F9D58;
                color: white;
            }
            
            .popup-details-btn:hover {
                background-color: #3367D6;
            }
            
            .popup-directions-btn:hover {
                background-color: #0B8043;
            }
            
            #directions-panel {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 300px;
                max-height: 500px;
                overflow-y: auto;
                background-color: white;
                border-radius: 5px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                z-index: 1;
                padding: 10px;
                display: none;
            }
            
            .clear-directions-btn {
                position: absolute;
                top: 10px;
                left: 10px;
                background-color: white;
                border: none;
                border-radius: 3px;
                padding: 8px 12px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                cursor: pointer;
                font-size: 14px;
                display: none;
                z-index: 1;
            }
            
            .clear-directions-btn:hover {
                background-color: #f1f1f1;
            }
            
            /* Dark theme styles */
            body.dark-theme #directions-panel {
                background-color: #333;
                color: #f1f1f1;
            }
            
            body.dark-theme .clear-directions-btn {
                background-color: #333;
                color: #f1f1f1;
            }
            
            body.dark-theme .clear-directions-btn:hover {
                background-color: #444;
            }
            
            /* Map legend styles */
            .map-legend {
                position: absolute;
                bottom: 10px;
                left: 10px;
                background-color: white;
                border-radius: 5px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                padding: 10px;
                z-index: 1;
                font-size: 12px;
                max-width: 200px;
            }
            
            .map-legend h3 {
                margin-top: 0;
                margin-bottom: 5px;
                font-size: 14px;
            }
            
            .map-legend ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .map-legend li {
                display: flex;
                align-items: center;
                margin-bottom: 5px;
            }
            
            .marker-icon {
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 5px;
            }
            
            .marker-icon.apartment {
                background-color: #4285F4;
            }
            
            .marker-icon.house {
                background-color: #0F9D58;
            }
            
            .marker-icon.studio {
                background-color: #9C27B0;
            }
            
            .marker-icon.villa {
                background-color: #FF9800;
            }
            
            .marker-icon.penthouse {
                background-color: #EA4335;
            }
            
            /* Dark theme for map legend */
            body.dark-theme .map-legend {
                background-color: #333;
                color: #f1f1f1;
            }
        `;
        
        // Add style to document
        document.head.appendChild(style);
    }
}

// Create and export a singleton instance
const mapManager = new MapManager();