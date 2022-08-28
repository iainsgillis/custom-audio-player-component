class AudioPlayer extends HTMLElement {
  isPlaying = false;
  isInitialized = false;
  userVolume = 1;

  buttonBackgroundSvgCss = `
  [data-playing='paused'] {
    background-image: url(./custom-audio/assets/player-play.svg);
  }
  [data-playing='playing'] {
    background-image: url(./custom-audio/assets/player-pause.svg);
  }
  [data-volume='on'] {
    background-image: url(./custom-audio/assets/volume.svg);
  }
  [data-volume='mid'] {
    background-image: url(./custom-audio/assets/volume-2.svg);
  }
  [data-volume='silent'] {
    background-image: url(./custom-audio/assets/volume-3.svg);
  }
  [data-volume='off'] {
    background-image: url(./custom-audio/assets/volume-off.svg);
  }
  `;

  inputRangeCss = `[type=range] {
    -webkit-appearance: none;
    background: transparent;
    margin: 12px 0;
    width: 100%;
  }
  [type=range]::-moz-focus-outer {
    border: 0;
  }
  [type=range]:focus {
    outline: 0;
  }
  [type=range]:focus::-webkit-slider-runnable-track {
    background: white;
  }
  [type=range]:focus::-ms-fill-lower {
    background: hsl(215deg, 20%, 90%);
  }
  [type=range]:focus::-ms-fill-upper {
    background: white;
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
    this.audioCtx = new AudioContext();
    this.gainNode = new GainNode(this.audioCtx);
    this.audioSrc = this.audioCtx.createMediaElementSource(this.audio);
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
    this.audio.currentTime = this.progressBar.value = 0;
    this.playButton.textContent = "play";
    this.playButton.dataset.playing = "paused";
    this.wrapper.classList.remove("playing");
    this.isPlaying = false;
  }

  handleLoadedMetadata() {
    const d = this.audio.duration;
    this.progressBar.setAttribute("max", d);
    this.trackDuration.textContent = this.formatTime(d);
  }

  handleTimeUpdated() {
    const t = this.audio.currentTime;
    this.progressBar.value = t;
    this.currentTime.textContent = this.formatTime(t);
  }

  handleInput() {
    this.audio.currentTime = this.progressBar.value;
    this.currentTime.textContent = this.formatTime(this.audio.currentTime);
  }

  handleKeyUp(event) {
    switch (event.key) {
      case "ArrowDown":
        this.adjustVolume("down");
        break;
      case "ArrowUp":
        this.adjustVolume("up");
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
  }

  addEventListeners() {
    this.playButton.addEventListener("click", this.togglePlaying.bind(this));
    this.volumeButton.addEventListener("click", this.toggleVolume.bind(this));
    this.audio.addEventListener(
      "loadedmetadata",
      this.handleLoadedMetadata.bind(this)
    );
    this.audio.addEventListener(
      "timeupdate",
      this.handleTimeUpdated.bind(this)
    );
    this.audio.addEventListener("ended", this.handleAudioEnded.bind(this));
    this.progressBar.addEventListener("input", this.handleInput.bind(this));
    this.wrapper.addEventListener("keyup", this.handleKeyUp.bind(this));
    this.progressBar.addEventListener("keyup", (e) => {
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

  skipAhead() {
    this.audio.currentTime = Math.min(
      this.audio.duration,
      this.audio.currentTime + 10
    );
  }

  skipBack() {
    this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
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
  border: 1px solid var(--color-primary);
  box-shadow:
    0 0 2px 2px var(--color-primary), 
    0 0 4px 4px white,
    0 0 6px 6px var(--color-primary);
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
<div class="audio-wrapper">
  <audio preload="metadata" style="display: none"></audio>
  <button title="toggle play/pause" data-playing="paused">${this.playText}</button>
  <div><span id="currentTime">0:00</span><span id="sep">/</span><span id="trackDuration">0:00</span></div>
  <input id="progress" type="range" min="0" max="100" value="0" />
  <button title="toggle mute" data-volume="on">${this.volumeText}</button>
</div>
`;
  }

  connectedCallback() {}
  disconnectedCallback() {}
  attributeChangedCallback(attrName, oldVal, newVal) {}
  adoptedCallback() {}
}

customElements.define("audio-player", AudioPlayer);
