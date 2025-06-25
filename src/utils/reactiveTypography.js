// Reactive Typography System
const ReactiveTypography = {
    // Time-based adjustments
    timeBasedAdjustments() {
        const hour = new Date().getHours();
        const root = document.documentElement;
        
        // Evening/Night (6 PM - 5 AM): Slightly larger, more spaced for easier reading
        if (hour >= 18 || hour < 5) {
            root.style.setProperty('--font-size-base', '1.05rem');
            root.style.setProperty('--line-height-base', '1.7');
            root.style.setProperty('--letter-spacing-base', '0.01em');
        }
        // Morning (5 AM - 11 AM): Standard size, crisp
        else if (hour >= 5 && hour < 11) {
            root.style.setProperty('--font-size-base', '1rem');
            root.style.setProperty('--line-height-base', '1.6');
            root.style.setProperty('--letter-spacing-base', '0');
        }
        // Afternoon (11 AM - 6 PM): Slightly more compact
        else {
            root.style.setProperty('--font-size-base', '0.98rem');
            root.style.setProperty('--line-height-base', '1.5');
            root.style.setProperty('--letter-spacing-base', '-0.01em');
        }
    },

    // Reading speed adaptation
    initReadingSpeedAdaptation() {
        let startTime, endTime, wordCount;
        const minWordsPerMinute = 200;
        const maxWordsPerMinute = 400;

        // Start timing when user starts scrolling
        document.addEventListener('scroll', () => {
            if (!startTime) {
                startTime = Date.now();
            }
        }, { once: true });

        // Calculate reading speed when user reaches bottom
        window.addEventListener('scroll', () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                if (startTime && !endTime) {
                    endTime = Date.now();
                    const timeSpent = (endTime - startTime) / 1000 / 60; // minutes
                    
                    // Count words in main content
                    const mainContent = document.querySelector('main');
                    if (mainContent) {
                        wordCount = mainContent.textContent.trim().split(/\s+/).length;
                        const wordsPerMinute = Math.round(wordCount / timeSpent);

                        // Adjust typography based on reading speed
                        if (wordsPerMinute > maxWordsPerMinute) {
                            // Fast reader: slightly smaller, more compact
                            document.documentElement.style.setProperty('--font-size-base', '0.95rem');
                            document.documentElement.style.setProperty('--line-height-base', '1.5');
                        } else if (wordsPerMinute < minWordsPerMinute) {
                            // Slow reader: slightly larger, more spaced
                            document.documentElement.style.setProperty('--font-size-base', '1.1rem');
                            document.documentElement.style.setProperty('--line-height-base', '1.8');
                        }
                    }
                }
            }
        });
    },

    // Initialize the reactive typography system
    init() {
        // Set initial time-based adjustments
        this.timeBasedAdjustments();
        
        // Update every hour
        setInterval(() => this.timeBasedAdjustments(), 3600000);
        
        // Initialize reading speed adaptation
        if (!localStorage.getItem('reduced-motion')) {
            this.initReadingSpeedAdaptation();
        }
    }
};

export default ReactiveTypography;
