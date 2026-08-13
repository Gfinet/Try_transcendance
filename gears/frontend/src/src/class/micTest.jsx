import { useState, useEffect } from "react";

export function MicTest() {
    const [audioLevel, setAudioLevel] = useState(0);

    useEffect(() => {
        let audioContext;
        let analyser;
        let microphone;

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);
                microphone.connect(analyser);
                analyser.fftSize = 256;

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const checkVolume = () => {
                    analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / dataArray.length;
                    setAudioLevel(Math.round(average)); // Niveau de 0 à 255
                    requestAnimationFrame(checkVolume);
                };
                checkVolume();
            })
            .catch((err) => console.error("Erreur accès micro :", err));

        return () => {
            if (audioContext) audioContext.close();
        };
    }, []);

    return (
        <div style={{ padding: "5px", fontSize: "12px", color: audioLevel > 10 ? "#00ff00" : "#888" }}>
            🎤 Niveau Micro : {audioLevel} {audioLevel > 10 ? "(Voix détectée !)" : "(Silence)"}
        </div>
    );
}