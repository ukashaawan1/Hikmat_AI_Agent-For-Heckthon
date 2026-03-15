/**
 * AudioWorklet Processor for capturing microphone PCM audio
 * Converts Float32 samples to Int16 PCM at 16kHz for Gemini Live API
 */
class AudioCaptureProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 4096;
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length === 0) return true;

        const channelData = input[0];
        if (!channelData) return true;

        for (let i = 0; i < channelData.length; i++) {
            this.buffer[this.bufferIndex++] = channelData[i];

            if (this.bufferIndex >= this.bufferSize) {
                // Convert Float32 to Int16 PCM
                const pcmData = new Int16Array(this.bufferSize);
                for (let j = 0; j < this.bufferSize; j++) {
                    const s = Math.max(-1, Math.min(1, this.buffer[j]));
                    pcmData[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Send PCM buffer to main thread
                this.port.postMessage({
                    type: 'audio',
                    data: pcmData.buffer
                }, [pcmData.buffer]);

                this.buffer = new Float32Array(this.bufferSize);
                this.bufferIndex = 0;
            }
        }

        return true;
    }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);
