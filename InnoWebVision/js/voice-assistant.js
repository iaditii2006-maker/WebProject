const orb = document.getElementById("ai-orb");
const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 200;
canvas.height = 200;

let audioCtx, analyser, dataArray;

// 🎧 MIC + VOLUME DETECTION
async function initMic() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioCtx.createMediaStreamSource(stream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  dataArray = new Uint8Array(analyser.frequencyBinCount);
}

function drawWaves() {
  requestAnimationFrame(drawWaves);
  if (!analyser) return;

  analyser.getByteFrequencyData(dataArray);
  const volume = dataArray.reduce((a,b)=>a+b) / dataArray.length;

  ctx.clearRect(0,0,200,200);
  ctx.beginPath();
  ctx.arc(100,100,40 + volume/12,0,Math.PI*2);
  ctx.strokeStyle = `rgba(99,102,241,${volume/180})`;
  ctx.lineWidth = 3;
  ctx.stroke();
}

// 🎙️ VOICE RECOGNITION
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-IN";
recognition.continuous = true;

orb.addEventListener("click", async () => {
  orb.classList.add("listening");
  await initMic();
  drawWaves();
  recognition.start();
});

recognition.onresult = (e) => {
  const text = e.results[e.results.length - 1][0].transcript.toLowerCase();

  if (text.includes("hey inno")) {
    speak("Yes, how can I help you?");
  } else {
    handleCommand(text);
  }
};

// 🧠 BASIC COMMANDS (can upgrade to AI)
function handleCommand(text) {
  if (text.includes("portfolio")) {
    speak("Opening portfolio");
    window.location.href = "#portfolio";
  } else if (text.includes("contact")) {
    speak("Opening contact section");
    window.location.href = "#contact";
  } else {
    speak("I am listening");
  }
}

// 🔊 AI VOICE
function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  msg.rate = 1;
  msg.onend = () => orb.classList.remove("listening");
  speechSynthesis.speak(msg);
}
