class AudioPlayer extends HTMLElement {
  isPlaying = false;
  isInitialized = false;
  userVolume = 1;
  customAudioSvgPath = "/user/themes/dos-hermanos/node_modules/custom-audio/svg";

  buttonBackgroundSvgCss = `
  button[data-playing], button[data-volume] {
    height: 24px;
    width: 24px;
    margin-inline: 4px;
    padding-inline: 12px;
    background-color: var(--color-audioplayer-svg, black);
  }
  [data-playing='paused'] {
    -webkit-mask-image: url(${this.customAudioSvgPath}/player-play.svg);
    mask-image: url(${this.customAudioSvgPath}/player-play.svg);
  }
  [data-playing='playing'] {
    -webkit-mask-image: url(${this.customAudioSvgPath}/player-pause.svg);
    mask-image: url(${this.customAudioSvgPath}/player-pause.svg);
  }
  [data-volume='on'] {
    -webkit-mask-image: url(${this.customAudioSvgPath}/volume.svg);
    mask-image: url(${this.customAudioSvgPath}/volume.svg);
  }
  [data-volume='mid'] {
    -webkit-mask-image: url(${this.customAudioSvgPath}/volume-2.svg);
    mask-image: url(${this.customAudioSvgPath}/volume-2.svg);
  }
  [data-volume='silent'] {
    -webkit-mask-image: url(${this.customAudioSvgPath}/volume-3.svg);
    mask-image: url(${this.customAudioSvgPath}/volume-3.svg);
  }
  [data-volume='off'] {
    -webkit-mask-image: url(${this.customAudioSvgPath}/volume-off.svg);
    mask-image: url(${this.customAudioSvgPath}/volume-off.svg);
  }
  [data-loading] {
    animation: blink 1s ease alternate infinite;
  }
  @keyframes blink {
    from { opacity: 0.75; }
    to { opacity: 0.25; }
  }
  `;

  inputRangeCss = `[type=range] {
    -webkit-appearance: none;
    background: transparent;
    margin: 12px 0;
    width: 100%;
  }
 
  [type=range]::-webkit-slider-runnable-track {
    cursor: default;
    height: 6px;
    transition: all 0.2s ease;
    width: 100%;
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2), 0 0 1px rgba(13, 13, 13, 0.2);
    background: hsl(215deg, 20%, 90%);
    border: 2px solid #cfd8dc;
    border-radius: 0px;
  }
  [type=range]::-webkit-slider-thumb {
    box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.2), 0 0 4px rgba(13, 13, 13, 0.2);
    background: hsl(215deg, 100%, 25%);
    border: 2px solid hsl(215deg, 20%, 90%);
    border-radius: 0px;
    box-sizing: border-box;
    cursor: default;
    height: 24px;
    width: 12px;
    -webkit-appearance: none;
    margin-top: -11px;
  }
  [type=range]::-moz-range-track {
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2), 0 0 1px rgba(13, 13, 13, 0.2);
    cursor: default;
    height: 6px;
    transition: all 0.2s ease;
    width: 100%;
    background: hsl(215deg, 20%, 90%);
    border: 2px solid #cfd8dc;
    border-radius: 0px;
    height: 3px;
  }
  [type=range]::-moz-range-thumb {
    box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.2), 0 0 4px rgba(13, 13, 13, 0.2);
    background: hsl(215deg, 100%, 25%);
    border: 2px solid hsl(215deg, 20%, 90%);
    border-radius: 0px;
    box-sizing: border-box;
    cursor: default;
    height: 24px;
    width: 12px;
  }
  [type=range]::-ms-track {
    cursor: default;
    height: 6px;
    transition: all 0.2s ease;
    width: 100%;
    background: transparent;
    border-color: transparent;
    border-width: 12px 0;
    color: transparent;
  }
  [type=range]::-ms-fill-lower {
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2), 0 0 1px rgba(13, 13, 13, 0.2);
    background: #c2cad6;
    border: 2px solid #cfd8dc;
    border-radius: 0px;
  }
  [type=range]::-ms-fill-upper {
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2), 0 0 1px rgba(13, 13, 13, 0.2);
    background: hsl(215deg, 20%, 90%);
    border: 2px solid #cfd8dc;
    border-radius: 0px;
  }
  [type=range]::-ms-thumb {
    box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.2), 0 0 4px rgba(13, 13, 13, 0.2);
    background: hsl(215deg, 100%, 25%);
    border: 2px solid hsl(215deg, 20%, 90%);
    border-radius: 0px;
    box-sizing: border-box;
    cursor: default;
    height: 24px;
    width: 12px;
    margin-top: 1.5px;
  }
  [type=range]:disabled::-webkit-slider-thumb, [type=range]:disabled::-moz-range-thumb, [type=range]:disabled::-ms-thumb, [type=range]:disabled::-webkit-slider-runnable-track, [type=range]:disabled::-ms-fill-lower, [type=range]:disabled::-ms-fill-upper {
    cursor: not-allowed;
  }
  :disabled {
    filter: grayscale(1);
    cursor: not-allowed !important;
  }


  `;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
    this.grabReferencesToElements();
    this.audio.src = this.getAttribute("src");
    this.addEventListeners();
  }

  initAudio() {
    if (this.isInitialized) return;
    this.audioCtx = new AudioContext();
    this.gainNode = new GainNode(this.audioCtx);
    this.audioSrc = this.audioCtx.createMediaElementSource(this.audio);
    this.audio.currentTime = parseFloat(this.progressBar.value, 10);
    this.audioSrc.connect(this.gainNode).connect(this.audioCtx.destination);
    this.isInitialized = true;
  }

  async togglePlaying() {
    if (!this.isInitialized) {
      this.initAudio();
    }
    if (this.isPlaying) {
      this.audio.pause();
      this.playButton.textContent = "play";
      this.playButton.dataset.playing = "paused";
      this.wrapper.classList.remove("playing");
      this.isPlaying = false;
    } else {
      this.audio.currentTime = parseFloat(this.progressBar.value, 10);
      await this.audio.play();
      this.playButton.textContent = "pause";
      this.playButton.dataset.playing = "playing";
      this.wrapper.classList.add("playing");
      this.isPlaying = true;
      this.dispatchEvent(
        new CustomEvent("startedplayer", {
          bubbles: true,
          cancelable: false,
          composed: true,
        })
      );
    }
  }

  grabReferencesToElements() {
    this.wrapper = this.shadowRoot.querySelector(".audio-wrapper");
    this.audio = this.shadowRoot.querySelector("audio");
    this.progressBar = this.shadowRoot.querySelector("#progress");
    this.playButton = this.shadowRoot.querySelector("[data-playing]");
    this.volumeButton = this.shadowRoot.querySelector("[data-volume]");
    this.currentTime = this.shadowRoot.querySelector("#currentTime");
    this.trackDuration = this.shadowRoot.querySelector("#trackDuration");
  }

  handleAudioEnded() {
    this.audio.currentTime = 0;
    this.progressBar.value = "0";
    this.currentTime.textContent = "0:00";
    this.playButton.textContent = "play";
    this.playButton.dataset.playing = "paused";
    this.wrapper.classList.remove("playing");
    this.isPlaying = false;
  }

  handleLoadedMetadata() {
    const d = this.audio.duration;
    this.progressBar.setAttribute("max", d);
    this.trackDuration.textContent = this.formatTime(d);
    this.volumeButton.removeAttribute("disabled");
    this.playButton.removeAttribute("disabled");
    this.progressBar.removeAttribute("disabled");
    this.wrapper.removeAttribute("data-loading");
  }

  handleTimeUpdated() {
    const t = this.audio.currentTime;
    this.progressBar.value = t;
    this.currentTime.textContent = this.formatTime(t);
  }

  handleInput() {
    this.initAudio();
    this.audio.currentTime = this.progressBar.value;
    this.currentTime.textContent = this.formatTime(this.progressBar.value);
  }

  handleKeyUp(event) {
    let newTimeVal;
    this.initAudio();
    switch (event.key) {
      case "ArrowDown":
        if (event.target.getAttribute("id") === "progress")
          event.preventDefault();
        this.adjustVolume("down");
        break;
      case "ArrowUp":
        if (event.target.getAttribute("id") === "progress")
          event.preventDefault();
        this.adjustVolume("up");
        break;
      case "ArrowLeft":
        if (event.target.getAttribute("id") === "progress")
          event.preventDefault();
        newTimeVal = this.skipBack(5);
        break;
      case "ArrowRight":
        if (event.target.getAttribute("id") === "progress")
          event.preventDefault();
        newTimeVal = this.skipAhead(5);
        break;
      case "m":
        this.toggleVolume();
        break;
      case "k":
        this.togglePlaying();
        break;
      case "j":
        this.skipBack();
        break;
      case "l":
        this.skipAhead();
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        this.seekTo(event.key);
        break;
    }
    if (newTimeVal) {
      this.currentTime.textContent = this.formatTime(newTimeVal);
      this.progressBar.value = newTimeVal;
    }
  }

  addEventListeners() {
    this.playButton.addEventListener("click", this.togglePlaying.bind(this));
    this.volumeButton.addEventListener("click", this.toggleVolume.bind(this));
    this.audio.addEventListener(
      "durationchange",
      this.handleLoadedMetadata.bind(this)
    );
    this.audio.addEventListener(
      "timeupdate",
      this.handleTimeUpdated.bind(this)
    );
    this.audio.addEventListener("ended", this.handleAudioEnded.bind(this));
    this.progressBar.addEventListener("input", this.handleInput.bind(this));
    this.wrapper.addEventListener("keydown", this.handleKeyUp.bind(this));
    this.progressBar.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        this.togglePlaying();
      }
    });
    document.addEventListener("startedplayer", (e) => {
      for (const player of document.querySelectorAll("audio-player")) {
        if (
          player.audio.src !== e.target.audio.src &&
          player.wrapper.classList.contains("playing")
        ) {
          player.togglePlaying();
        }
      }
    });
  }

  adjustVolume(direction) {
    this.gainNode.gain.value =
      direction === "up"
        ? Math.min(1, this.gainNode.gain.value + 0.2)
        : Math.max(0, this.gainNode.gain.value - 0.2);
    this.userVolume = this.gainNode.gain.value;
    this.setVolumeIcon();
  }

  skipAhead(n = 10) {
    this.audio.currentTime = Math.min(
      this.audio.duration,
      this.audio.currentTime + n
    );
    return this.audio.currentTime;
  }

  skipBack(n = 10) {
    this.audio.currentTime = Math.max(0, this.audio.currentTime - n);
    return this.audio.currentTime;
  }

  seekTo(key) {
    const pct = parseInt(key, 10) / 10;
    const t = this.audio.duration * pct;
    this.audio.currentTime = this.progressBar.value = t;
  }

  formatTime(t) {
    const MM = Math.floor(t / 60);
    const SS = (t % 60).toFixed(0).padStart(2, "0");
    return `${MM}:${SS}`;
  }

  toggleVolume() {
    if (!this.isInitialized) {
      this.initAudio();
    }
    if (this.audio.muted) {
      this.gainNode.gain.value = this.userVolume;
      this.setVolumeIcon();
      this.volumeButton.textContent = "turn sound on";
      this.audio.muted = false;
    } else {
      this.gainNode.gain.value = 0;
      this.volumeButton.dataset.volume = "off";
      this.volumeButton.textContent = "mute";
      this.audio.muted = true;
    }
  }

  setVolumeIcon() {
    let attr = "";
    if (this.userVolume === 0) {
      attr = "silent";
    } else if (this.userVolume < 0.5) {
      attr = "mid";
    } else {
      attr = "on";
    }
    this.volumeButton.dataset.volume = attr;
  }

  render() {
    this.shadowRoot.innerHTML = `
<style>
* {
  box-sizing: border-box;
}

.sr-only {
  border: 0;
  clip: rect(0 0 0 0);
  height: auto;
  margin: 0;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
}

.audio-wrapper {
  min-height: 3rem;
  min-width: 100px;
  max-width: 100%;
  padding: 4px;
  margin-inline: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  border: 1px solid var(--color-grey-mid);
}

.playing {
  border: 1px solid var(--color-playing, var(--color-primary));
  box-shadow:
    0 0 2px 2px var(--color-playing, var(--color-primary)), 
    0 0 4px 4px white,
    0 0 6px 6px var(--color-playing, var(--color-primary));
}

button {
  font-size: 0;
  height: 3rem;
  width: 3rem;
  background-size: 100% 100%;
  background-color: transparent;
  border: none;
  display: grid;
  place-items: center;
  padding: 0;
  margin: 4px 0;
  cursor: pointer;
}

[id] {
  color: var(--color-primary);
}

#sep {
  margin-inline: 0.25ch;
}

${this.buttonBackgroundSvgCss}

${this.inputRangeCss}

</style>
<div class="audio-wrapper" data-loading>
  <audio preload="none" style="display: none"></audio>
  <label class="sr-only" for="progress">This input is used as the progress bar for the playback of this track. Press "k" to toggle play/pause; press "m" to toggle mute"; press j or l to skip back or forward by 10 seconds; press left or right arrow to skip back or forward by 5 seconds. Increase and decrease volume with the up and down arrow keys.</label>
  <button title="toggle play/pause" data-playing="paused" disabled>${this.playText}</button>
  <div><span id="currentTime">0:00</span><span id="sep">/</span><span id="trackDuration">0:00</span></div>
  <input id="progress" type="range" min="0" max="100" value="0" disabled/>
  <button title="toggle mute" data-volume="on" disabled>${this.volumeText}</button>
</div>
`;
  }

  makeLazy = (target) => {
    const intersectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.audio.setAttribute("preload", "metadata");
            observer.disconnect();
          }
        });
      }
    );
    intersectionObserver.observe(target);
  };

  connectedCallback() {
    this.makeLazy(this.shadowRoot.host);
  }
  disconnectedCallback() {}
  attributeChangedCallback(attrName, oldVal, newVal) {}
  adoptedCallback() {}
}

customElements.define("audio-player", AudioPlayer);
