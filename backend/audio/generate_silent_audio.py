"""
Generate a silent audio file of specified duration.
"""

import numpy as np
import soundfile as sf
from pathlib import Path


def generate_silent_audio(duration_seconds: int = 60, sample_rate: int = 16000, output_path: str = None):
    """
    Generate a silent audio file.
    
    Args:
        duration_seconds: Duration of the silent audio in seconds (default: 60)
        sample_rate: Sample rate of the audio in Hz (default: 16000 Hz)
        output_path: Path to save the audio file (default: silent_60s.wav in current directory)
    
    Returns:
        Path to the generated audio file
    """
    if output_path is None:
        output_path = "silent_60s.wav"
    
    # Create silent audio array (all zeros)
    num_samples = duration_seconds * sample_rate
    silent_audio = np.zeros(num_samples, dtype=np.float32)
    
    # Write to file
    sf.write(output_path, silent_audio, sample_rate)
    
    print(f"✓ Silent audio generated successfully!")
    print(f"  Duration: {duration_seconds} seconds")
    print(f"  Sample rate: {sample_rate} Hz")
    print(f"  Output file: {output_path}")
    
    return output_path


if __name__ == "__main__":
    # Generate 60-second silent audio
    generate_silent_audio(duration_seconds=60, sample_rate=16000)
