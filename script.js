class AudioVisualizer {
    constructor() {
        this.canvas = document.getElementById('audioCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.stopButton = document.getElementById('stopButton');
        
        // Set canvas size (doubled width)
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        // Audio context and nodes
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.isMuted = false;
        
        // Animation frame ID
        this.animationFrameId = null;
        
        // Bind event listeners
        this.stopButton.addEventListener('click', () => this.toggleMute());
        
        // Start recording automatically
        this.startRecording();
    }
    
    async startRecording() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Create audio context and nodes
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            
            // Configure analyser
            this.analyser.fftSize = 2048;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            // Connect nodes
            this.microphone.connect(this.analyser);
            
            // Update UI
            this.stopButton.disabled = false;
            this.stopButton.textContent = 'Mute';
            
            // Start animation
            this.animate();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.stopButton.textContent = this.isMuted ? 'Unmute' : 'Mute';
        
        if (this.isMuted) {
            if (this.audioContext) {
                this.audioContext.suspend();
            }
        } else {
            if (this.audioContext) {
                this.audioContext.resume();
            }
        }
    }
    
    animate() {
        if (!this.analyser) return;
        
        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw dividing line
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();
        
        // Create gradient for the wave
        const gradient = this.ctx.createLinearGradient(0, this.canvas.height / 2, 0, 0);
        gradient.addColorStop(0, '#0066cc');
        gradient.addColorStop(1, '#00a2ff');
        
        // Draw top wave
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        
        // Draw the wave path with reflection
        const centerX = this.canvas.width / 2;
        for (let i = 0; i < this.canvas.width; i++) {
            let amplitude;
            if (i < centerX) {
                // Left side - reflected wave
                const reflectionX = this.canvas.width - (i * 2);
                const reflectionDataIndex = Math.floor(reflectionX * this.dataArray.length / this.canvas.width);
                amplitude = this.isMuted ? 0 : (this.dataArray[reflectionDataIndex] / 255) * (this.canvas.height / 2);
            } else {
                // Right side - direct wave
                const rightX = (i - centerX) * 2;
                const dataIndex = Math.floor(rightX * this.dataArray.length / this.canvas.width);
                amplitude = this.isMuted ? 0 : (this.dataArray[dataIndex] / 255) * (this.canvas.height / 2);
            }
            
            const y = (this.canvas.height / 2) - amplitude;
            this.ctx.lineTo(i, y);
        }
        
        // Complete the wave shape
        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.lineTo(0, this.canvas.height / 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw bottom wave (reflection)
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        
        // Draw the reflected wave path with reflection
        for (let i = 0; i < this.canvas.width; i++) {
            let amplitude;
            if (i < centerX) {
                // Left side - reflected wave
                const reflectionX = this.canvas.width - (i * 2);
                const reflectionDataIndex = Math.floor(reflectionX * this.dataArray.length / this.canvas.width);
                amplitude = this.isMuted ? 0 : (this.dataArray[reflectionDataIndex] / 255) * (this.canvas.height / 2);
            } else {
                // Right side - direct wave
                const rightX = (i - centerX) * 2;
                const dataIndex = Math.floor(rightX * this.dataArray.length / this.canvas.width);
                amplitude = this.isMuted ? 0 : (this.dataArray[dataIndex] / 255) * (this.canvas.height / 2);
            }
            
            const y = (this.canvas.height / 2) + amplitude;
            this.ctx.lineTo(i, y);
        }
        
        // Complete the reflected wave shape
        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.lineTo(0, this.canvas.height / 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
}

// Initialize the visualizer when the page loads
window.addEventListener('load', () => {
    new AudioVisualizer();
}); 