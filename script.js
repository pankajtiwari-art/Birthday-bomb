/* ============================================================
   JIYA'S BIRTHDAY ROOM — script.js
   Made by Pankaj
   ------------------------------------------------------------
   Silent. Minimal. No libraries.

   Handles:
     ①  Switch ON → room reveal
     ②  JIYA bulbs light up J → I → Y → A
     ③  Cake tap → candles out → balloons
     ④  Letter tap → Hinglish letter modal
     ⑤  Gift tap → shake → lid pop → Birthday Bomb
     ⑥  Escape key closes overlays
     ⑦  Respects prefers-reduced-motion
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     ELEMENT REFS
     ============================================================ */

  const introScreen   = document.getElementById('intro-screen');
  const lightSwitch   = document.getElementById('light-switch');
  const room          = document.getElementById('room');

  const jiyaSign      = document.getElementById('jiya-sign');
  const bulbLetters   = jiyaSign
    ? jiyaSign.querySelectorAll('.bulb-letter')
    : [];

  const cake          = document.getElementById('cake');
  const letter        = document.getElementById('letter');
  const gift1         = document.getElementById('gift-1');
  const gift2         = document.getElementById('gift-2');

  const balloonLayer  = document.getElementById('balloon-layer');

  const letterModal   = document.getElementById('letter-modal');
  const letterClose   = document.getElementById('letter-close');

  const bombOverlay   = document.getElementById('bomb-overlay');
  const bombClose     = document.getElementById('bomb-close');
  const bombConfetti  = document.getElementById('bomb-confetti');


  /* ============================================================
     STATE FLAGS
     ============================================================ */

  let roomTurnedOn  = false;
  let candlesBlown  = false;
  let bombShown     = false;
  let reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;


  /* ============================================================
     ①  LIGHT SWITCH → ROOM REVEAL
     ------------------------------------------------------------
     Sequence:
       • switch rocks (handled by CSS .on)
       • after a short beat, the room warms up
       • intro fades away
       • JIYA bulb sequence begins a moment later
     ============================================================ */

  function turnOnRoom() {
    if (roomTurnedOn) return;
    roomTurnedOn = true;

    // flip the switch
    if (lightSwitch) {
      lightSwitch.classList.add('on');
      lightSwitch.setAttribute('aria-pressed', 'true');
    }

    // small delay so the rocker is visibly moving before light floods in
    window.setTimeout(() => {
      if (room) {
        room.classList.add('lit');
        room.setAttribute('aria-hidden', 'false');
      }
      if (introScreen) {
        introScreen.classList.add('hidden');
      }
    }, 260);

    // remove the intro from layout after its fade completes
    window.setTimeout(() => {
      if (introScreen) {
        introScreen.style.display = 'none';
      }
    }, 1100);

    // start the JIYA bulb sequence once the room has warmed up
    window.setTimeout(startJiyaSequence, 950);
  }

  if (lightSwitch) {
    lightSwitch.addEventListener('click', turnOnRoom);
    lightSwitch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        turnOnRoom();
      }
    });
  }


  /* ============================================================
     ②  JIYA — bulbs light up one-by-one
     ------------------------------------------------------------
     J → I → Y → A  with a small gap between each letter.
     Halo + idle flicker are handled by CSS once .lit is added.
     ============================================================ */

  function startJiyaSequence() {
    if (!bulbLetters.length) return;

    const STEP_MS = reducedMotion ? 220 : 400;

    bulbLetters.forEach((letterEl, index) => {
      window.setTimeout(() => {
        letterEl.classList.add('lit');
      }, index * STEP_MS);
    });
  }


  /* ============================================================
     ③  CAKE — candles out, then balloons
     ------------------------------------------------------------
     Clicking the cake:
       • adds .blown → CSS kills the flame, shows smoke
       • a "blow puff" plays via CSS
       • balloons are released slightly after the flame dies
     ============================================================ */

  function blowCandles() {
    if (candlesBlown) return;
    candlesBlown = true;

    if (cake) cake.classList.add('blown');

    // let the flame die for a beat before balloons
    const gap = reducedMotion ? 80 : 320;
    window.setTimeout(releaseBalloons, gap);
  }

  if (cake) {
    cake.addEventListener('click', blowCandles);
    cake.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        blowCandles();
      }
    });
  }


  /* ============================================================
     ④  BALLOONS
     ------------------------------------------------------------
     Each balloon gets its own:
       • size          — variety
       • color         — soft pastel palette
       • left position — spread across the screen
       • horizontal drift  → CSS var --drift
       • rotation amount   → CSS var --tilt
       • animation delay   — slight stagger
       • animation duration — natural variation
     Then it is removed from the DOM automatically.
     ============================================================ */

  const BALLOON_COLORS = [
    '#f5bfd0', // soft pink
    '#c9b6e4', // lavender
    '#fdf6e8', // cream
    '#ffffff', // white
    '#bcd7f0', // light blue
    '#f6d2b0', // peach
    '#f8c9b8'  // warm blush
  ];

  // two shades per balloon so the bottom looks deeper
  function darken(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (n >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amount));
    const b = Math.max(0, Math.min(255, (n & 0xff) + amount));
    return '#' + (
      0x1000000 + (r << 16) + (g << 8) + b
    ).toString(16).slice(1);
  }

  function releaseBalloons() {
    if (!balloonLayer) return;

    // reduced motion → gentle handful only
    const COUNT    = reducedMotion ? 8 : 44;
    const BASE_DUR = reducedMotion ? 1.1 : 2.0;

    const frag = document.createDocumentFragment();

    for (let i = 0; i < COUNT; i++) {
      const balloon = document.createElement('div');
      balloon.className = 'balloon';

      // --- size ---
      const size = 30 + Math.random() * 36;   // 30 – 66 px wide
      const h    = size * 1.22;

      // --- color ---
      const base  = BALLOON_COLORS[
        Math.floor(Math.random() * BALLOON_COLORS.length)
      ];
      const deep  = darken(base, -34);

      // --- placement & motion ---
      const left   = Math.random() * 96;                // vw%
      const drift  = (Math.random() - 0.5) * 150;       // px
      const tilt   = (Math.random() - 0.5) * 28;        // deg
      const delay  = Math.random() * 0.35;              // s
      const dur    = BASE_DUR + Math.random() * 0.7;    // s

      balloon.style.left   = left + 'vw';
      balloon.style.width  = size + 'px';
      balloon.style.height = h + 'px';
      balloon.style.background =
        `radial-gradient(circle at 32% 28%, ` +
        `#ffffff 0%, ${base} 42%, ${deep} 100%)`;

      balloon.style.setProperty('--drift', drift + 'px');
      balloon.style.setProperty('--tilt',  tilt + 'deg');

      balloon.style.animationDelay    = delay + 's';
      balloon.style.animationDuration = dur + 's';

      frag.appendChild(balloon);

      // clean up after the animation finishes
      const lifetime = (delay + dur) * 1000 + 250;
      window.setTimeout(() => {
        if (balloon.parentNode) balloon.parentNode.removeChild(balloon);
      }, lifetime);
    }

    balloonLayer.appendChild(frag);
  }


  /* ============================================================
     ⑤  LETTER MODAL
     ------------------------------------------------------------
     • Tapping the letter reveals the modal.
     • The modal fades + scales in via CSS .open.
     • Close via X button, backdrop click, or Escape.
     ============================================================ */

  function openLetter() {
    if (!letterModal || !letterModal.hidden) return;

    letterModal.hidden = false;
    // force one frame so the transition actually plays
    requestAnimationFrame(() => {
      letterModal.classList.add('open');
    });

    // move focus to the close button for keyboard users
    if (letterClose) {
      window.setTimeout(() => letterClose.focus(), 60);
    }
  }

  function closeLetter() {
    if (!letterModal || letterModal.hidden) return;

    letterModal.classList.remove('open');

    window.setTimeout(() => {
      letterModal.hidden = true;
      if (letter) letter.focus();
    }, 340);
  }

  if (letter) {
    letter.addEventListener('click', openLetter);
    letter.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLetter();
      }
    });
  }

  if (letterClose) {
    letterClose.addEventListener('click', closeLetter);
  }

  if (letterModal) {
    letterModal.addEventListener('click', (e) => {
      if (e.target === letterModal) closeLetter();
    });
  }


  /* ============================================================
     ⑥  GIFTS — shake → open → Birthday Bomb
     ------------------------------------------------------------
     Sequence:
       • shake (CSS: .shake)
       • golden spark rises (CSS handles it during .shake)
       • lid pops + burst ring (CSS: .open)
       • a short beat later → Birthday Bomb overlay
     ============================================================ */

  function openGift(giftEl) {
    if (!giftEl) return;
    if (giftEl.classList.contains('open')) return;
    if (giftEl.classList.contains('shake')) return;

    giftEl.classList.add('shake');

    window.setTimeout(() => {
      giftEl.classList.remove('shake');
      giftEl.classList.add('open');

      // reveal the Birthday Bomb after the lid has flown
      const revealDelay = reducedMotion ? 200 : 480;
      window.setTimeout(showBomb, revealDelay);
    }, 560);
  }

  if (gift1) {
    gift1.addEventListener('click', () => openGift(gift1));
    gift1.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGift(gift1);
      }
    });
  }

  if (gift2) {
    gift2.addEventListener('click', () => openGift(gift2));
    gift2.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGift(gift2);
      }
    });
  }


  /* ============================================================
     ⑦  BIRTHDAY BOMB OVERLAY
     ------------------------------------------------------------
     • Spawns falling confetti inside .bomb-confetti
     • Each piece is a tiny <span> with random size/color/timing
     • Overlay closes on X click, backdrop click, or Escape
     ============================================================ */

  const CONFETTI_COLORS = [
    '#ffd166',
    '#ff8fb1',
    '#c9a0ff',
    '#fdf6e8',
    '#ffb547',
    '#bcd7f0'
  ];

  function showBomb() {
    if (!bombOverlay || bombShown) return;
    bombShown = true;

    spawnBombConfetti();

    bombOverlay.hidden = false;
    requestAnimationFrame(() => {
      bombOverlay.classList.add('open');
    });

    if (bombClose) {
      window.setTimeout(() => bombClose.focus(), 60);
    }
  }

  function hideBomb() {
    if (!bombOverlay || bombOverlay.hidden) return;

    bombOverlay.classList.remove('open');

    window.setTimeout(() => {
      bombOverlay.hidden = true;
      // clear confetti so re-opens feel fresh
      if (bombConfetti) bombConfetti.innerHTML = '';
    }, 420);
  }

  function spawnBombConfetti() {
    if (!bombConfetti) return;

    const COUNT = reducedMotion ? 20 : 95;

    const frag = document.createDocumentFragment();

    for (let i = 0; i < COUNT; i++) {
      const piece = document.createElement('span');

      const color = CONFETTI_COLORS[
        Math.floor(Math.random() * CONFETTI_COLORS.length)
      ];

      const size  = 5 + Math.random() * 8;             // 5 – 13 px
      const tall  = size * (1.2 + Math.random() * 0.8);
      const left  = Math.random() * 100;               // vw%
      const dur   = 2.0 + Math.random() * 1.6;         // 2.0 – 3.6 s
      const delay = Math.random() * 0.9;               // s
      const round = Math.random() > 0.5;

      piece.style.left       = left + 'vw';
      piece.style.width      = size + 'px';
      piece.style.height     = tall + 'px';
      piece.style.background = color;
      piece.style.opacity    = 0.9;
      piece.style.borderRadius = round ? '50%' : '2px';

      piece.style.animationDuration = dur + 's';
      piece.style.animationDelay    = delay + 's';

      frag.appendChild(piece);
    }

    bombConfetti.appendChild(frag);
  }

  if (bombClose) {
    bombClose.addEventListener('click', hideBomb);
  }

  if (bombOverlay) {
    bombOverlay.addEventListener('click', (e) => {
      if (e.target === bombOverlay) hideBomb();
    });
  }


  /* ============================================================
     ⑧  KEYBOARD — Escape closes any open overlay
     ============================================================ */

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    if (letterModal && !letterModal.hidden) {
      closeLetter();
      return;
    }

    if (bombOverlay && !bombOverlay.hidden) {
      hideBomb();
    }
  });


  /* ============================================================
     ⑨  RESPOND TO MOTION PREFERENCE CHANGES
     ------------------------------------------------------------
     If the user flips the OS setting mid-session,
     new animations will respect the new value.
     ============================================================ */

  const motionQuery = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  // addEventListener is the modern API; older Safari uses addListener
  const onMotionChange = (e) => {
    reducedMotion = e.matches;
  };

  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', onMotionChange);
  } else if (typeof motionQuery.addListener === 'function') {
    motionQuery.addListener(onMotionChange);
  }

})();
