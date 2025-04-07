/**
 * Chat Interface Module
 * Responsible for managing the chat UI and interactions
 */

class ChatInterface {
    constructor() {
        this.messagesContainer = null;
        this.userInput = null;
        this.sendButton = null;
        this.voiceButton = null;
        this.queryChips = null;
        this.onSendCallback = null;
        this.isTypingIndicatorVisible = false;
    }

    /**
     * Initialize the chat interface
     * @param {Object} config - Configuration object
     * @param {string} config.messagesContainerId - ID of the chat messages container
     * @param {string} config.userInputId - ID of the user input field
     * @param {string} config.sendButtonId - ID of the send button
     * @param {string} config.voiceButtonId - ID of the voice input button
     * @param {Function} config.onSendMessage - Callback when message is sent
     */
    init(config) {
        this.messagesContainer = document.getElementById(config.messagesContainerId);
        this.userInput = document.getElementById(config.userInputId);
        this.sendButton = document.getElementById(config.sendButtonId);
        this.voiceButton = document.getElementById(config.voiceButtonId);
        this.queryChips = document.querySelectorAll('.query-chip');
        this.onSendCallback = config.onSendMessage;

        // Set up event listeners
        this.setupEventListeners();
        
        // Add welcome message
        this.addAssistantMessage(
            "Welcome to Chennai Property Search! I can help you find rental properties in Chennai. " +
            "You can ask me questions like 'Show me 2BHK apartments in Adyar' or 'Find pet-friendly properties in Anna Nagar'. " +
            "What kind of property are you looking for today?"
        );
    }

    /**
     * Set up event listeners for chat interface
     */
    setupEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => {
            this.sendUserMessage();
        });

        // Enter key press in input field
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendUserMessage();
            }
        });

        // Example query chips
        this.queryChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const queryText = chip.textContent;
                this.userInput.value = queryText;
                this.sendUserMessage();
            });
        });
    }

    /**
     * Send user message
     */
    sendUserMessage() {
        const message = this.userInput.value.trim();
        if (message) {
            // Add message to chat
            this.addUserMessage(message);
            
            // Clear input
            this.userInput.value = '';
            
            // Focus input
            this.userInput.focus();
            
            // Show typing indicator
            this.showTypingIndicator();
            
            // Call callback function
            if (this.onSendCallback) {
                this.onSendCallback(message);
            }
        }
    }

    /**
     * Add user message to chat
     * @param {string} message - Message text
     */
    addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message user';
        messageElement.textContent = message;
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    /**
     * Add assistant message to chat
     * @param {string} message - Message text
     */
    addAssistantMessage(message) {
        // Hide typing indicator if visible
        this.hideTypingIndicator();
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message assistant';
        
        // Support for HTML content
        if (message.includes('<') && message.includes('>')) {
            messageElement.innerHTML = message;
        } else {
            messageElement.textContent = message;
        }
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        if (!this.isTypingIndicatorVisible) {
            const indicator = document.createElement('div');
            indicator.className = 'typing-indicator';
            indicator.id = 'typing-indicator';
            indicator.innerHTML = '<span></span><span></span><span></span>';
            this.messagesContainer.appendChild(indicator);
            this.scrollToBottom();
            this.isTypingIndicatorVisible = true;
        }
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
            this.isTypingIndicatorVisible = false;
        }
    }

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    /**
     * Set callback for when message is sent
     * @param {Function} callback - Function to call when message is sent
     */
    setOnSendCallback(callback) {
        this.onSendCallback = callback;
    }

    /**
     * Enable or disable user input
     * @param {boolean} enabled - Whether input should be enabled
     */
    setInputEnabled(enabled) {
        this.userInput.disabled = !enabled;
        this.sendButton.disabled = !enabled;
        this.voiceButton.disabled = !enabled;
    }

    /**
     * Clear chat history
     */
    clearChat() {
        // Keep only the first message (welcome message)
        while (this.messagesContainer.childNodes.length > 1) {
            this.messagesContainer.removeChild(this.messagesContainer.lastChild);
        }
    }

    /**
     * Add a suggestion chip to the chat
     * @param {string} text - Suggestion text
     * @param {Function} onClick - Click handler
     */
    addSuggestionChip(text, onClick) {
        const chip = document.createElement('button');
        chip.className = 'suggestion-chip';
        chip.textContent = text;
        chip.addEventListener('click', () => {
            if (onClick) {
                onClick(text);
            } else {
                this.userInput.value = text;
                this.sendUserMessage();
            }
        });
        
        // Create container if it doesn't exist
        let suggestionsContainer = this.messagesContainer.querySelector('.suggestions-container');
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'suggestions-container';
            this.messagesContainer.appendChild(suggestionsContainer);
        }
        
        suggestionsContainer.appendChild(chip);
        this.scrollToBottom();
    }

    /**
     * Add multiple suggestion chips
     * @param {Array} suggestions - Array of suggestion texts
     * @param {Function} onClick - Click handler
     */
    addSuggestions(suggestions, onClick) {
        // Create container
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'suggestions-container';
        
        // Add chips
        suggestions.forEach(text => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.textContent = text;
            chip.addEventListener('click', () => {
                if (onClick) {
                    onClick(text);
                } else {
                    this.userInput.value = text;
                    this.sendUserMessage();
                }
            });
            
            suggestionsContainer.appendChild(chip);
        });
        
        this.messagesContainer.appendChild(suggestionsContainer);
        this.scrollToBottom();
    }
}

// Create and export a singleton instance
const chatInterface = new ChatInterface();
