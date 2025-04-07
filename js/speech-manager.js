/**
 * Speech Manager Module
 * Responsible for handling speech recognition and synthesis
 */

class SpeechManager {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.voiceButton = null;
        this.onResultCallback = null;
        this.onEndCallback = null;
        this.preferredVoice = null;
        this.isSpeaking = false;
    }

    /**
     * Initialize speech recognition
     * @param {Object} config - Configuration object
     * @param {string} config.voiceButtonId - ID of the voice input button
     * @param {Function} config.onResult - Callback when speech is recognized
     * @param {Function} config.onEnd - Callback when recognition ends
     */
    init(config) {
        if (!this.isRecognitionSupported()) {
            console.warn('Speech recognition is not supported in this browser');
            return;
        }

        // Initialize Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        // Store callbacks
        this.onResultCallback = config.onResult;
        this.onEndCallback = config.onEnd;

        // Get voice button
        this.voiceButton = document.getElementById(config.voiceButtonId);

        // Set up event listeners
        this.setupEventListeners();
        
        // Load voices when available
        if (this.isSynthesisSupported()) {
            this.loadVoices();
            
            // Some browsers (like Chrome) load voices asynchronously
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
            }
        }

        console.log('Speech Manager initialized');
    }

    /**
     * Load available voices and select preferred voice
     */
    loadVoices() {
        if (!this.isSynthesisSupported()) return;
        
        const voices = this.synthesis.getVoices();
        
        // Try to find a female English voice
        this.preferredVoice = voices.find(voice => 
            (voice.name.includes('female') || voice.name.includes('Female')) && 
            (voice.lang.includes('en-') || voice.lang.includes('en_'))
        );
        
        // If no female English voice, try any English voice
        if (!this.preferredVoice) {
            this.preferredVoice = voices.find(voice => 
                voice.lang.includes('en-') || voice.lang.includes('en_')
            );
        }
        
        // If still no voice, use the first available
        if (!this.preferredVoice && voices.length > 0) {
            this.preferredVoice = voices[0];
        }
        
        console.log('Preferred voice:', this.preferredVoice ? this.preferredVoice.name : 'None available');
    }

    /**
     * Set up event listeners for speech recognition
     */
    setupEventListeners() {
        if (!this.recognition || !this.voiceButton) return;

        // Voice button click
        this.voiceButton.addEventListener('click', () => {
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        });

        // Recognition result
        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            if (event.results[0].isFinal && this.onResultCallback) {
                this.onResultCallback(transcript);
            }
        };

        // Recognition end
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceButton();
            
            if (this.onEndCallback) {
                this.onEndCallback();
            }
        };

        // Recognition error
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateVoiceButton();
            
            // Show error message if permission denied
            if (event.error === 'not-allowed') {
                alert('Microphone access is required for voice input. Please allow microphone access in your browser settings.');
            }
        };
    }

    /**
     * Start listening for speech
     */
    startListening() {
        if (!this.recognition) return;
        
        // Stop any ongoing speech
        if (this.isSpeaking) {
            this.stopSpeaking();
        }

        try {
            this.recognition.start();
            this.isListening = true;
            this.updateVoiceButton();
            
            // Add listening notification
            this.addListeningNotification();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
        }
    }

    /**
     * Stop listening for speech
     */
    stopListening() {
        if (!this.recognition) return;

        try {
            this.recognition.stop();
            this.isListening = false;
            this.updateVoiceButton();
            
            // Remove listening notification
            this.removeListeningNotification();
        } catch (error) {
            console.error('Error stopping speech recognition:', error);
        }
    }

    /**
     * Add listening notification to chat
     */
    addListeningNotification() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        // Remove existing notification if any
        this.removeListeningNotification();
        
        // Create notification
        const notification = document.createElement('div');
        notification.id = 'listening-notification';
        notification.className = 'listening-notification';
        notification.innerHTML = '<i class="fas fa-microphone"></i> Listening...';
        
        chatMessages.appendChild(notification);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Remove listening notification from chat
     */
    removeListeningNotification() {
        const notification = document.getElementById('listening-notification');
        if (notification) {
            notification.remove();
        }
    }

    /**
     * Update voice button appearance based on listening state
     */
    updateVoiceButton() {
        if (!this.voiceButton) return;

        if (this.isListening) {
            this.voiceButton.classList.add('listening');
            this.voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            this.voiceButton.title = 'Stop listening';
        } else {
            this.voiceButton.classList.remove('listening');
            this.voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            this.voiceButton.title = 'Start voice input';
        }
    }

    /**
     * Speak text using speech synthesis
     * @param {string} text - Text to speak
     * @param {Object} options - Speech options
     * @param {number} options.rate - Speech rate (0.1 to 10)
     * @param {number} options.pitch - Speech pitch (0 to 2)
     * @param {boolean} options.showIndicator - Whether to show speaking indicator
     */
    speak(text, options = {}) {
        if (!this.isSynthesisSupported()) return;

        // Cancel any ongoing speech
        this.stopSpeaking();

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set options
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        
        // Use preferred voice if available
        if (this.preferredVoice) {
            utterance.voice = this.preferredVoice;
        }
        
        // Set up events
        utterance.onstart = () => {
            this.isSpeaking = true;
            
            // Show speaking indicator if requested
            if (options.showIndicator !== false) {
                this.showSpeakingIndicator();
            }
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.hideSpeakingIndicator();
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
            this.hideSpeakingIndicator();
        };
        
        // Speak
        this.synthesis.speak(utterance);
    }

    /**
     * Stop any ongoing speech
     */
    stopSpeaking() {
        if (!this.isSynthesisSupported()) return;
        
        this.synthesis.cancel();
        this.isSpeaking = false;
        this.hideSpeakingIndicator();
    }

    /**
     * Show speaking indicator
     */
    showSpeakingIndicator() {
        // Create indicator if it doesn't exist
        let indicator = document.getElementById('speaking-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'speaking-indicator';
            indicator.className = 'speaking-indicator';
            indicator.innerHTML = '<i class="fas fa-volume-up"></i> Speaking...';
            
            // Add to body
            document.body.appendChild(indicator);
        }
        
        // Show indicator
        indicator.style.display = 'flex';
    }

    /**
     * Hide speaking indicator
     */
    hideSpeakingIndicator() {
        const indicator = document.getElementById('speaking-indicator');
        
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    /**
     * Check if speech recognition is supported
     * @returns {boolean} - True if supported
     */
    isRecognitionSupported() {
        return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    }

    /**
     * Check if speech synthesis is supported
     * @returns {boolean} - True if supported
     */
    isSynthesisSupported() {
        return 'speechSynthesis' in window;
    }
}

// Create and export a singleton instance
const speechManager = new SpeechManager();
