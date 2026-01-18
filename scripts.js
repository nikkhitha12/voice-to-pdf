let recognition;
let selectedLang = localStorage.getItem('selectedLang') || 'en-US';

const resultElement = document.getElementById("result");
const statusText = document.getElementById("status-text");
const langSelect = document.getElementById("lang-select");
langSelect.value = selectedLang;

function changeLanguage() {
  selectedLang = langSelect.value;
  localStorage.setItem('selectedLang', selectedLang);
  if (recognition) recognition.lang = selectedLang;
}

function startConverting() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Use Chrome Desktop for speech recognition.");
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.lang = selectedLang;
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    statusText.textContent = "🎤 Listening...";
    statusText.classList.add('listening');
    document.querySelector(".record-btn").classList.add("active");
  };

  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';
    for (let i = 0; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalTranscript += transcript + ' ';
      else interimTranscript += transcript;
    }
    resultElement.innerHTML = finalTranscript + `<span style="opacity:0.6">${interimTranscript}</span>`;
    updateCounts(resultElement.innerText);
  };

  recognition.onerror = (event) => {
    console.error(event.error);
    stopConverting();
    statusText.textContent = "❌ Error: " + event.error;
  };

  recognition.onend = () => {
    statusText.textContent = "Recording stopped ⏹️";
    statusText.classList.remove('listening');
    document.querySelector(".record-btn").classList.remove("active");
  };

  recognition.start();
}

function stopConverting() {
  if (recognition) recognition.stop();
}

function updateCounts(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const chars = text.replace(/\s+/g,'').length;
  document.getElementById("word-count").textContent = `Words: ${words.length}`;
  document.getElementById("char-count").textContent = `Characters: ${chars}`;
  document.getElementById("read-time").textContent = `Reading Time: ${Math.ceil(words.length/200)} min`;
}

function copyText() {
  const text = resultElement.innerText;
  if (!text) return alert("Nothing to copy!");
  navigator.clipboard.writeText(text).then(() => alert("Copied 📋"));
}

function downloadPDF() {
  const text = resultElement.innerText.trim();
  if (!text) return alert("Nothing to download!");
  const fileName = prompt("Enter PDF file name:", "transcript");
  if (!fileName) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("📝 Voice Transcript", 15, 20);

  const date = new Date();
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${date.toLocaleString()}`, 15, 28);

  doc.setFontSize(12);
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 15, 38);

  doc.save(fileName + ".pdf");
}

function clearTranscript() {
  resultElement.innerHTML = '';
  updateCounts('');
  statusText.textContent = "Transcript cleared 🗑️";
}
