/**
 * Play a subtle notification sound using Web Audio API
 * Generates a pleasant two-tone beep
 */
export function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // First tone (higher pitch)
        const oscillator1 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();

        oscillator1.connect(gainNode1);
        gainNode1.connect(audioContext.destination);

        oscillator1.frequency.value = 800; // Hz
        oscillator1.type = 'sine';

        gainNode1.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode1.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

        oscillator1.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.15);

        // Second tone (lower pitch) - starts slightly after first
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();

        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);

        oscillator2.frequency.value = 600; // Hz
        oscillator2.type = 'sine';

        gainNode2.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
        gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.11);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

        oscillator2.start(audioContext.currentTime + 0.1);
        oscillator2.stop(audioContext.currentTime + 0.25);

    } catch (error) {
        // Silently fail if audio context is not supported
        console.warn('Sonnerie en panne:', error);
    }
}

/**
 * Play a message notification sound
 * Different from notification sound - uses a double-beep pattern
 */
export function playMessageSound() {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // First short beep
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        osc1.frequency.value = 700;
        osc1.type = 'sine';
        gain1.gain.setValueAtTime(0, audioContext.currentTime);
        gain1.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.01);
        gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
        osc1.start(audioContext.currentTime);
        osc1.stop(audioContext.currentTime + 0.08);

        // Second short beep
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 700;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
        gain2.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.11);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.18);
        osc2.start(audioContext.currentTime + 0.1);
        osc2.stop(audioContext.currentTime + 0.18);

    } catch (error) {
        console.warn('Sonnerie en panne:', error);
    }
}
