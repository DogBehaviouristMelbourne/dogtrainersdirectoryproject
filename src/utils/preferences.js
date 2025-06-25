// Preferences Panel Management
document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('preferences-panel');
    const content = document.getElementById('preferences-content');
    const toggle = panel?.querySelector('.preferences-toggle');
    const fontSlider = document.getElementById('font-size');

    // Handle click outside
    document.addEventListener('click', (e) => {
        if (panel?.classList.contains('active') && 
            !panel.contains(e.target) && 
            e.target !== toggle) {
            panel.classList.remove('active');
        }
    });

    // Toggle panel
    toggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        panel?.classList.toggle('active');
    });

    // Font size handling
    function updateFontSize(scale) {
        const html = document.documentElement;
        html.style.setProperty('--font-scale', scale);
        localStorage.setItem('userFontScale', scale);
        
        // Update slider value
        if (fontSlider) {
            fontSlider.value = scale;
        }
    }

    // Initialize font size from localStorage
    const savedScale = localStorage.getItem('userFontScale');
    if (savedScale) {
        updateFontSize(savedScale);
    }

    // Font size slider
    fontSlider?.addEventListener('input', (e) => {
        updateFontSize(e.target.value);
    });

    // Font size buttons
    window.adjustFontSize = (change) => {
        if (!fontSlider) return;
        const currentValue = parseFloat(fontSlider.value);
        const newValue = Math.max(0.8, Math.min(1.4, currentValue + change));
        updateFontSize(newValue);
    };
});
