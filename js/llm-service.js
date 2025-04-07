/**
 * LLM Service Module
 * Responsible for processing natural language queries using Gemini API
 */

class LlmService {
    constructor() {
        this.apiKey = null;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }

    /**
     * Initialize the LLM service
     * @param {Object} config - Configuration object
     * @param {string} config.apiKey - Gemini API key
     */
    init(config) {
        this.apiKey = config.apiKey;
        console.log('LLM Service initialized');
    }

    /**
     * Set API key
     * @param {string} apiKey - Gemini API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Process a natural language query
     * @param {string} query - User query
     * @returns {Promise<string>} - Response text
     */
    async processQuery(query) {
        // Check if API key is set
        if (!this.apiKey) {
            return "Please set your Gemini API key in the API Settings to enable natural language processing.";
        }

        try {
            // For demo purposes, we'll use a rule-based approach instead of actual API calls
            // In a production environment, this would make a real API call to Gemini
            return this.generateResponse(query);
        } catch (error) {
            console.error('Error processing query with LLM:', error);
            throw error;
        }
    }

    /**
     * Generate a response based on the query (rule-based for demo)
     * @param {string} query - User query
     * @returns {string} - Response text
     */
    generateResponse(query) {
        const queryLower = query.toLowerCase();
        
        // Check for location-based queries
        if (queryLower.includes('adyar')) {
            return `I found several properties in Adyar, Chennai. This is a popular residential area with good connectivity and amenities. The properties range from ₹15,000 to ₹45,000 per month depending on size and amenities.`;
        } else if (queryLower.includes('anna nagar')) {
            return `Anna Nagar is a premium residential area in Chennai. I found properties ranging from ₹18,000 to ₹50,000 per month. Most properties here are well-maintained and offer good amenities.`;
        } else if (queryLower.includes('t. nagar') || queryLower.includes('t nagar')) {
            return `T. Nagar is a central location in Chennai known for shopping and good connectivity. I found properties ranging from ₹16,000 to ₹40,000 per month.`;
        } else if (queryLower.includes('velachery')) {
            return `Velachery is a developing residential area with good IT connectivity. I found properties ranging from ₹14,000 to ₹35,000 per month.`;
        } else if (queryLower.includes('porur')) {
            return `Porur is located in the western part of Chennai with good connectivity to IT corridors. I found properties ranging from ₹12,000 to ₹30,000 per month.`;
        }
        
        // Check for property type queries
        if (queryLower.includes('apartment') || queryLower.includes('flat')) {
            return `I found several apartments that match your criteria. Apartments in Chennai typically come with amenities like security, power backup, and sometimes a gym or swimming pool.`;
        } else if (queryLower.includes('house') || queryLower.includes('independent')) {
            return `I found some independent houses that match your criteria. Independent houses offer more privacy and sometimes come with small gardens or private terraces.`;
        } else if (queryLower.includes('studio')) {
            return `I found a few studio apartments that match your criteria. Studio apartments are compact and usually suitable for singles or couples.`;
        } else if (queryLower.includes('villa')) {
            return `I found some villas that match your criteria. Villas are premium properties often located in gated communities with extensive amenities.`;
        } else if (queryLower.includes('penthouse')) {
            return `I found a few penthouses that match your criteria. Penthouses are luxury properties usually located on the top floors with excellent views and premium amenities.`;
        }
        
        // Check for BHK queries
        if (queryLower.includes('1bhk') || queryLower.includes('1 bhk')) {
            return `I found several 1BHK properties that match your criteria. 1BHK properties are typically compact and suitable for singles or couples.`;
        } else if (queryLower.includes('2bhk') || queryLower.includes('2 bhk')) {
            return `I found several 2BHK properties that match your criteria. 2BHK is the most common configuration in Chennai and suitable for small families.`;
        } else if (queryLower.includes('3bhk') || queryLower.includes('3 bhk')) {
            return `I found several 3BHK properties that match your criteria. 3BHK properties offer more space and are suitable for families.`;
        } else if (queryLower.includes('4bhk') || queryLower.includes('4 bhk')) {
            return `I found a few 4BHK properties that match your criteria. 4BHK properties are spacious and usually come with premium amenities.`;
        }
        
        // Check for budget queries
        if (queryLower.includes('under 15000') || queryLower.includes('less than 15000')) {
            return `I found some properties under ₹15,000 per month. These are typically 1BHK properties or studio apartments in suburban areas.`;
        } else if (queryLower.includes('under 20000') || queryLower.includes('less than 20000')) {
            return `I found several properties under ₹20,000 per month. These include 1BHK and 2BHK properties in various localities.`;
        } else if (queryLower.includes('under 30000') || queryLower.includes('less than 30000')) {
            return `I found many properties under ₹30,000 per month. These include 2BHK and 3BHK properties in good localities.`;
        } else if (queryLower.includes('under 50000') || queryLower.includes('less than 50000')) {
            return `I found premium properties under ₹50,000 per month. These include 3BHK and 4BHK properties in upscale localities.`;
        } else if (queryLower.includes('luxury') || queryLower.includes('premium')) {
            return `I found some luxury properties that match your criteria. These premium properties come with high-end amenities and are located in upscale localities.`;
        }
        
        // Check for amenities queries
        if (queryLower.includes('furnished')) {
            return `I found several furnished properties that match your criteria. Furnished properties come with essential furniture and appliances, saving you the hassle of buying or moving furniture.`;
        } else if (queryLower.includes('semi furnished')) {
            return `I found several semi-furnished properties that match your criteria. Semi-furnished properties typically come with basic furniture and fixtures.`;
        } else if (queryLower.includes('unfurnished')) {
            return `I found several unfurnished properties that match your criteria. Unfurnished properties give you the flexibility to furnish according to your taste.`;
        } else if (queryLower.includes('pet') || queryLower.includes('dog') || queryLower.includes('cat')) {
            return `I found some pet-friendly properties that match your criteria. Pet-friendly properties allow you to keep pets, though some may have restrictions on pet type or size.`;
        } else if (queryLower.includes('parking')) {
            return `I found properties with parking facilities that match your criteria. Parking is an important amenity in Chennai due to limited street parking.`;
        } else if (queryLower.includes('gym') || queryLower.includes('fitness')) {
            return `I found properties with gym facilities that match your criteria. These are typically in apartment complexes with shared amenities.`;
        } else if (queryLower.includes('swimming') || queryLower.includes('pool')) {
            return `I found properties with swimming pools that match your criteria. These are premium properties usually in upscale apartment complexes.`;
        }
        
        // Default response
        return `I found several properties that might interest you. You can filter them further by specifying location, property type, budget, or amenities. For example, you can ask for "2BHK apartments in Adyar under 25,000" or "pet-friendly houses in Anna Nagar".`;
    }

    /**
     * Extract filter criteria from query and response
     * @param {string} query - User query
     * @param {string} response - LLM response
     * @returns {Object} - Filter criteria
     */
    extractFilterCriteria(query, response) {
        const queryLower = query.toLowerCase();
        const criteria = {};
        
        // Extract location
        const locations = ['adyar', 'anna nagar', 't. nagar', 't nagar', 'velachery', 'porur', 'mylapore', 'besant nagar', 'kilpauk', 'nungambakkam', 'alwarpet', 'royapettah', 'perambur', 'chrompet', 'tambaram', 'pallavaram', 'madipakkam', 'medavakkam', 'sholinganallur', 'siruseri', 'kelambakkam', 'thoraipakkam', 'omr', 'ecr', 'gst', 'chennai'];
        for (const location of locations) {
            if (queryLower.includes(location)) {
                criteria.locality = location.charAt(0).toUpperCase() + location.slice(1);
                break;
            }
        }
        
        // Extract property type
        if (queryLower.includes('apartment') || queryLower.includes('flat')) {
            criteria.propertyType = 'Apartment';
        } else if (queryLower.includes('house') || queryLower.includes('independent')) {
            criteria.propertyType = 'Independent House';
        } else if (queryLower.includes('studio')) {
            criteria.propertyType = 'Studio Apartment';
        } else if (queryLower.includes('villa')) {
            criteria.propertyType = 'Villa';
        } else if (queryLower.includes('penthouse')) {
            criteria.propertyType = 'Penthouse';
        }
        
        // Extract BHK using regex to be more accurate
        const bhkMatch = queryLower.match(/(\d)\s*bhk/i);
        if (bhkMatch && bhkMatch[1]) {
            const bhkValue = parseInt(bhkMatch[1], 10);
            criteria.bhk = bhkValue;
        }
        
        // Extract budget
        const budgetRegex = /under (\d+),?(\d+)?|less than (\d+),?(\d+)?|below (\d+),?(\d+)?|maximum (\d+),?(\d+)?|max (\d+),?(\d+)?/i;
        const budgetMatch = queryLower.match(budgetRegex);
        if (budgetMatch) {
            let budget = 0;
            for (let i = 1; i < budgetMatch.length; i++) {
                if (budgetMatch[i]) {
                    if (i % 2 === 1) {
                        budget = parseInt(budgetMatch[i]) * 1000;
                    } else {
                        budget = parseInt(budgetMatch[i - 1] + budgetMatch[i]);
                    }
                    break;
                }
            }
            if (budget > 0) {
                criteria.maxRent = budget;
            }
        }
        
        // Extract furnishing status
        if (queryLower.includes('fully furnished') || queryLower.includes('fully-furnished')) {
            criteria.furnishingStatus = 'Fully Furnished';
        } else if (queryLower.includes('semi furnished') || queryLower.includes('semi-furnished')) {
            criteria.furnishingStatus = 'Semi Furnished';
        } else if (queryLower.includes('unfurnished')) {
            criteria.furnishingStatus = 'Unfurnished';
        }
        
        // Extract pet-friendly
        if (queryLower.includes('pet friendly') || queryLower.includes('pet-friendly') || 
            queryLower.includes('pets allowed') || queryLower.includes('allow pets') || 
            queryLower.includes('pet') || queryLower.includes('dog') || queryLower.includes('cat')) {
            criteria.petsAllowed = true;
        }
        
        return criteria;
    }
}

// Create and export a singleton instance
const llmService = new LlmService();