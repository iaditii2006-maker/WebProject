// Simple Chatbot + Voice Assistant
document.addEventListener('DOMContentLoaded', () => {
  // Inject chatbot HTML into the page
  const chatbotContainer = document.createElement('div');
  chatbotContainer.className = 'chatbot';
  chatbotContainer.innerHTML = `
    <button class="chatbot-toggle" id="chatToggle" aria-expanded="false" aria-controls="chatWindow">
      <span aria-hidden="true">💬</span>
      <span class="label">Chat</span>
      <span class="sr-only">Open chat assistant</span>
    </button>
    <div class="chat-window" id="chatWindow" role="region" aria-label="Chat assistant">
      <div class="chat-header">InnoWebVision Assistant</div>
      <div class="chat-messages" id="chatMessages" aria-live="polite"></div>
      <div class="chat-input-area">
        <input type="text" id="chatInput" placeholder="Ask about audits, pricing, or booking..." aria-label="Chat message" />
        <button class="chat-mic" id="chatMic" title="Speak" aria-pressed="false">🎤</button>
        <button class="chat-btn" id="chatSend">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(chatbotContainer);

  // Dynamically position the chatbot above the back-to-top button when available
  function positionChatAboveBackToTop() {
    const backToTop = document.getElementById('backToTop') || document.querySelector('.back-to-top');
    // Only position dynamically on larger viewports
    if (!backToTop || window.innerWidth <= 520) {
      // reset any inline positioning for mobile
      chatbotContainer.style.right = '';
      chatbotContainer.style.bottom = '';
      return;
    }

    const rect = backToTop.getBoundingClientRect();
    // compute distance from bottom and right of viewport
    const gap = 12; // px gap between back-to-top and chat
    const bottomOffset = window.innerHeight - rect.top + gap; // distance above back button
    const rightOffset = window.innerWidth - rect.right + 30; // align roughly with back-to-top; extra 30px for spacing

    // Apply as fixed positioning
    chatbotContainer.style.position = 'fixed';
    chatbotContainer.style.right = (rightOffset > 0 ? rightOffset + 'px' : '30px');
    chatbotContainer.style.bottom = (bottomOffset + 'px');
  }

  // initial position and listeners
  positionChatAboveBackToTop();
  window.addEventListener('resize', positionChatAboveBackToTop);
  window.addEventListener('scroll', positionChatAboveBackToTop);

  const toggle = document.getElementById('chatToggle');
  const windowEl = document.getElementById('chatWindow');
  const messages = document.getElementById('chatMessages');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const micBtn = document.getElementById('chatMic');

  // Inactivity timers (auto-close)
  const INACTIVITY_TIMEOUT_MS = 90000; // 90s
  const WARNING_BEFORE_MS = 10000; // show warning 10s before closing
  let inactivityTimer = null;
  let warningTimer = null;

  function clearInactivityTimers() {
    if (inactivityTimer) { clearTimeout(inactivityTimer); inactivityTimer = null; }
    if (warningTimer) { clearTimeout(warningTimer); warningTimer = null; }
  }

  function showInactivityWarning() {
    const warn = document.createElement('div');
    warn.className = 'chat-message bot chat-warning';
    warn.textContent = 'This chat will close soon due to inactivity.';
    messages.appendChild(warn);
    messages.scrollTop = messages.scrollHeight;
    // remove warning after 7s
    setTimeout(() => { warn.remove(); }, 7000);
  }

  function closeDueToInactivity() {
    if (windowEl.classList.contains('open')) {
      windowEl.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
      appendMessage('Chat closed due to inactivity. Reopen to continue.', 'bot');
    }
    clearInactivityTimers();
  }

  function startInactivityTimers() {
    clearInactivityTimers();
    warningTimer = setTimeout(showInactivityWarning, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS);
    inactivityTimer = setTimeout(closeDueToInactivity, INACTIVITY_TIMEOUT_MS);
  }

  function resetInactivityTimers() {
    if (windowEl.classList.contains('open')) startInactivityTimers();
  }

  const appendMessage = (text, who = 'bot') => {
    const el = document.createElement('div');
    el.className = 'chat-message ' + (who === 'user' ? 'user' : 'bot');
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    // activity happened — reset timers
    resetInactivityTimers();
  };

  const botReply = (userText) => {
    const text = (userText || '').toLowerCase();
    // Rule-based responses
    if (!text.trim()) return "Can you share a bit more?";
    if (text.includes('audit')) return 'You can request a free website audit via the contact form — or tell me your website URL and I can give a quick tip.';
    if (text.includes('price') || text.includes('cost') || text.includes('quote')) return 'Our redesigns typically run from $5K–$15K depending on features. Would you like a free audit to get a custom quote?';
    if (text.includes('book') || text.includes('booking')) return 'We focus on improving direct booking flows. We can integrate booking engines and optimize CTAs for conversions.';
    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) return 'Hi! I can help with audits, pricing, and booking questions — ask me anything.';
    if (text.includes('speed') || text.includes('slow')) return 'Performance matters — we optimize images, caching, and critical CSS to improve speed and bookings.';
    if (text.includes('contact') || text.includes('email')) return 'You can reach us at info@innowebvision.com — or submit the audit request form on this page.';
    // fallback
    return "I can help with audits, pricing, and booking flows. If you want, say 'request audit' and I'll show the contact section.";
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // Simple send flow
  const send = (text, viaVoice = false) => {
    const cleaned = text.trim();
    if (!cleaned) return;
    appendMessage(cleaned, 'user');
    input.value = '';
    // show typing indicator
    const typing = document.createElement('div');
    typing.className = 'chat-message bot chat-typing';
    typing.textContent = 'Typing...';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const reply = botReply(cleaned);
      appendMessage(reply, 'bot');
      // speak bot reply if voice used or user has voice enabled
      if (viaVoice || localStorage.getItem('chatVoice') === 'true') {
        speak(reply);
      }
      // quick action: jump to contact when user asks for audit
      if (cleaned.toLowerCase().includes('request audit') || cleaned.toLowerCase().includes('free audit')) {
        const contact = document.getElementById('contact');
        if (contact) contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 600 + Math.min(cleaned.length * 12, 1200));
  };

  // Toggle chat (polished behavior)
  toggle.addEventListener('click', () => {
    const open = windowEl.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      setTimeout(() => {
        input.focus();
        // greet only if conversation is empty
        if (!messages.querySelector('.chat-message')) {
          appendMessage('Hello! I am the InnoWebVision assistant. Ask about audits, pricing, or booking.', 'bot');
        }
        // start inactivity timers when opened
        startInactivityTimers();
      }, 150);
    } else {
      toggle.focus();
      clearInactivityTimers();
    }
  });

  // Send on button
  sendBtn.addEventListener('click', () => send(input.value, false));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(input.value, false); } else { resetInactivityTimers(); } });
  input.addEventListener('input', resetInactivityTimers);

  // Voice recognition (optional)
  let recognition;
  let recognizing = false;
  if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new Rec();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { recognizing = true; micBtn.setAttribute('aria-pressed', 'true'); micBtn.textContent = '🎙️'; };
    recognition.onend = () => { recognizing = false; micBtn.setAttribute('aria-pressed', 'false'); micBtn.textContent = '🎤'; };
    recognition.onerror = (e) => { recognizing = false; micBtn.setAttribute('aria-pressed', 'false'); micBtn.textContent = '🎤'; console.warn('Speech error', e); };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      send(transcript, true);
    };
  }

  micBtn.addEventListener('click', () => {
    if (!recognition) {
      // No SpeechRecognition support
      appendMessage('Voice recognition is not supported in this browser.', 'bot');
      return;
    }
    if (recognizing) {
      recognition.stop();
    } else {
      recognition.start();
    }
    resetInactivityTimers();
  });

  // small accessibility: focus input when chat opens
  const obs = new MutationObserver(() => {
    if (windowEl.classList.contains('open')) input.focus();
  });
  obs.observe(windowEl, { attributes: true, attributeFilter: ['class'] });

  // initial greeting message (small)
  // keep it quiet until user opens chat to avoid interrupting page
});
