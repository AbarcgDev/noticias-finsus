import React, { useRef, useState, useEffect } from 'react';
import { AudioVisualizer } from 'react-audio-visualize';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css'; // Importa los estilos del reproductor

const MyPlayerWithVisualization = ({ audioSrc }) => {
    // 1. Mantenemos una referencia para el elemento <audio>
    const audioRef = useRef(null);

    return (
        <div>
            {/* 2. El reproductor de audio, que maneja toda la lógica. */}
            {/* Le pasamos la referencia para que podamos acceder a su elemento <audio>. */}
            <AudioPlayer
                src={audioSrc}
                autoPlay
                // Esto expone el elemento <audio> interno
                ref={audioRef}
            />

            {/* 3. El visualizador, que usa la referencia del reproductor para animarse. */}
            {/* Solo lo renderizamos si la referencia ya tiene el elemento. */}
            {audioRef.current && (
                <AudioVisualizer
                    audio={audioRef.current.audio.current} // Acceso al elemento <audio>
                    width={500}
                    height={100}
                    barWidth={4}
                    gap={2}
                    barColor="#4caf50"
                />
            )}
        </div>
    );
};

export default MyPlayerWithVisualization;