/**
 * Main JavaScript file
 * Responsible for initializing and coordinating all modules
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize API configuration
    apiConfig.init();
    
    // Initialize UI controller
    uiController.init({
        themeToggleId: 'theme-toggle-btn',
        helpButtonId: 'help-btn',
        helpModalId: 'help-modal',
        propertyModalId: 'property-modal',
        toggleResultsBtnId: 'toggle-results-btn',
        resultsSectionClass: 'results-section'
    });
    
    // Initialize map manager FIRST before using it
    const map = mapManager.initMap('map');
    
    // Add map styles
    mapManager.addMapStyles();
    
    // Initialize data loader
    dataLoader.init({
        dataUrl: 'data/chennai_data.csv'
    });
    
    // Initialize LLM service
    llmService.init({
        apiKey: apiConfig.getGeminiApiKey()
    });
    
    // Load data AFTER map is initialized
    dataLoader.loadData()
        .then(properties => {
            // Initialize filter processor
            filterProcessor.setProperties(properties);
            
            // Initialize chat interface
            chatInterface.init({
                messagesContainerId: 'chat-messages',
                userInputId: 'user-input',
                sendButtonId: 'send-btn',
                voiceButtonId: 'voice-input-btn',
                onSendMessage: (message) => {
                    // Process message with LLM service
                    llmService.processQuery(message)
                        .then(response => {
                            try {
                                // Add assistant response to chat first
                                chatInterface.addAssistantMessage(response);
                                
                                // Extract filter criteria
                                const filterCriteria = llmService.extractFilterCriteria(message, response);
                                console.log('Filter criteria:', filterCriteria);
                                
                                // Apply filters
                                let filteredProperties = [];
                                
                                // If BHK is a number (not an array), convert it to array format
                                if (typeof filterCriteria.bhk === 'number') {
                                    filterCriteria.bhk = [filterCriteria.bhk];
                                }
                                
                                filteredProperties = filterProcessor.applyFilters(filterCriteria);
                                console.log(`Found ${filteredProperties.length} properties matching criteria`);
                                
                                // If no properties found through filter criteria, try text search
                                if (filteredProperties.length === 0) {
                                    filteredProperties = filterProcessor.searchByText(message);
                                    console.log(`Found ${filteredProperties.length} properties using text search`);
                                }
                                
                                // If still no properties, just show some random properties
                                if (filteredProperties.length === 0) {
                                    // Get 10 random properties as fallback
                                    const allProperties = filterProcessor.properties;
                                    filteredProperties = allProperties.slice(0, Math.min(10, allProperties.length));
                                    console.log(`Showing ${filteredProperties.length} random properties as fallback`);
                                }
                                
                                // Update UI with filtered properties
                                uiController.updateResults(filteredProperties, filterCriteria);
                                
                                // Add property markers to map
                                mapManager.addPropertyMarkers(filteredProperties, (propertyId) => {
                                    const property = dataLoader.getPropertyById(propertyId);
                                    if (property) {
                                        uiController.showPropertyDetails(property);
                                    }
                                });
                                
                                // Speak response if speech is enabled
                                if (speechManager.isSynthesisSupported() && uiController.isSpeechEnabled()) {
                                    speechManager.speak(response);
                                }
                            } catch (error) {
                                console.error('Error processing query details:', error);
                                
                                // We already showed the response message, but still need to show some properties
                                const basicFilteredProperties = filterProcessor.searchByText(message);
                                
                                // Add property markers to map
                                mapManager.addPropertyMarkers(basicFilteredProperties, (propertyId) => {
                                    const property = dataLoader.getPropertyById(propertyId);
                                    if (property) {
                                        uiController.showPropertyDetails(property);
                                    }
                                });
                                
                                // Update UI with filtered properties
                                uiController.updateResults(basicFilteredProperties, {});
                            }
                        })
                }
            });
            
            // Initialize speech manager
            speechManager.init({
                voiceButtonId: 'voice-input-btn',
                onResult: (transcript) => {
                    // Set transcript as input value
                    document.getElementById('user-input').value = transcript;
                    
                    // Send message
                    chatInterface.sendUserMessage();
                },
                onEnd: () => {
                    console.log('Speech recognition ended');
                }
            });
            
            // Initialize results table
            resultsTable.init({
                tableId: 'results-table',
                tableBodyId: 'results-body',
                resultCountId: 'result-count',
                onViewDetails: (propertyId) => {
                    const property = dataLoader.getPropertyById(propertyId);
                    if (property) {
                        uiController.showPropertyDetails(property);
                    }
                },
                onFocusOnMap: (propertyId) => {
                    mapManager.focusOnMarker(propertyId);
                }
            });
            
            // Initialize export service
            exportService.init({
                exportCsvBtnId: 'export-csv-btn',
                exportPdfBtnId: 'export-pdf-btn',
                getPropertiesCallback: () => {
                    return uiController.getCurrentResults();
                }
            });
            
            // Add welcome message
            chatInterface.addAssistantMessage('Welcome to Chennai Property Search! How can I help you find your ideal rental property today?');
            
            // Check if API keys are set
            if (!apiConfig.areApiKeysSet()) {
                // Show message about API keys
                chatInterface.addAssistantMessage('Please set your Google Maps and Gemini API keys in the API Settings to enable all features.');
            }
        })
        .catch(error => {
            console.error('Error loading data:', error);
            chatInterface.addAssistantMessage('Sorry, I encountered an error loading property data. Please try refreshing the page.');
        });
});

// Make handler for property details globally available
window.handleViewPropertyDetails = function(propertyId) {
    const property = dataLoader.getPropertyById(propertyId);
    if (property) {
        uiController.showPropertyDetails(property);
    }
};

// Define initialization function for Google Maps API callback
window.initializeApp = function() {
    console.log("Google Maps API loaded successfully");
};