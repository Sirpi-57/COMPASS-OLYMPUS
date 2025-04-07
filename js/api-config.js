/**
 * API Configuration Module
 * Responsible for managing API keys and configuration
 */

class ApiConfig {
    constructor() {
        // Hardcoded API keys provided by the user
        this.googleMapsApiKey = 'AIzaSyBNDmXsoIvbW0s1dScrup0v0qwrDNb2w4k';
        this.geminiApiKey = 'AIzaSyB6onaQatjVBDRFAoX3Tr0OdX8Fx6oRpU4';
    }

    /**
     * Initialize API configuration
     */
    init() {
        console.log('API Configuration initialized with hardcoded keys');
        
        // Update API keys in services
        this.updateApiKeys();
    }

    /**
     * Update API keys in services
     */
    updateApiKeys() {
        // Update Gemini API key
        this.updateGeminiApiKey();
    }

    /**
     * Update Gemini API key
     */
    updateGeminiApiKey() {
        // Update LLM service API key if available
        if (window.llmService && this.geminiApiKey) {
            llmService.setApiKey(this.geminiApiKey);
        }
    }

    /**
     * Get Google Maps API key
     * @returns {string} - Google Maps API key
     */
    getGoogleMapsApiKey() {
        return this.googleMapsApiKey;
    }

    /**
     * Get Gemini API key
     * @returns {string} - Gemini API key
     */
    getGeminiApiKey() {
        return this.geminiApiKey;
    }

    /**
     * Check if API keys are set
     * @returns {boolean} - True if both API keys are set
     */
    areApiKeysSet() {
        return true; // Always true since keys are hardcoded
    }
}

// Create and export a singleton instance
const apiConfig = new ApiConfig();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    apiConfig.init();
});
