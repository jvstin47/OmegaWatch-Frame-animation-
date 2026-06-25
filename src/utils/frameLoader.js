export class SequenceFrameLoader {
  constructor(folderPath, totalFrames = 300) {
    this.folderPath = folderPath;
    this.totalFrames = totalFrames;
    this.frames = [];
    this.loadedCount = 0;
    this.started = false;
    this.onProgressCallbacks = new Set();
    this.onCompleteCallbacks = new Set();
  }

  start(onProgress, onComplete) {
    if (onProgress) this.onProgressCallbacks.add(onProgress);
    if (onComplete) this.onCompleteCallbacks.add(onComplete);

    if (this.started) {
      if (this.loadedCount === this.totalFrames) {
        if (onComplete) onComplete();
      } else {
        if (onProgress) onProgress(Math.round((this.loadedCount / this.totalFrames) * 100));
      }
      return;
    }
    this.started = true;

    // Phase 1: Preload skeleton frames (every 10th frame)
    const phase1 = [];
    for (let i = 1; i <= this.totalFrames; i += 10) {
      phase1.push(i);
    }

    // Phase 2: Preload mid-density (every 5th frame)
    const phase2 = [];
    for (let i = 1; i <= this.totalFrames; i += 5) {
      if (!phase1.includes(i)) phase2.push(i);
    }

    // Phase 3: Preload all remaining frames
    const phase3 = [];
    for (let i = 1; i <= this.totalFrames; i++) {
      if (!phase1.includes(i) && !phase2.includes(i)) phase3.push(i);
    }

    const loadQueue = [...phase1, ...phase2, ...phase3];

    const loadNext = () => {
      if (loadQueue.length === 0) return;
      const frameIndex = loadQueue.shift();
      const img = new Image();
      const padIndex = String(frameIndex).padStart(3, '0');
      img.src = `${this.folderPath}/ezgif-frame-${padIndex}.png`;
      img.onload = () => {
        const finalizeLoad = () => {
          this.frames[frameIndex] = img;
          this.loadedCount++;
          
          const pct = Math.round((this.loadedCount / this.totalFrames) * 100);
          this.onProgressCallbacks.forEach(cb => cb(pct));

          if (this.loadedCount === this.totalFrames) {
            this.onCompleteCallbacks.forEach(cb => cb());
          }
          loadNext();
        };

        if (typeof img.decode === 'function') {
          img.decode()
            .then(finalizeLoad)
            .catch(finalizeLoad);
        } else {
          finalizeLoad();
        }
      };
      img.onerror = () => {
        console.warn(`Failed to load frame ${frameIndex} from ${this.folderPath}`);
        this.loadedCount++;
        loadNext();
      };
    };

    // Parallel load workers
    const workers = 6;
    for (let w = 0; w < workers; w++) {
      loadNext();
    }
  }

  getFrame(index) {
    if (this.frames[index]) return this.frames[index];
    
    // Nearest neighbor interpolation fallback
    let left = index;
    let right = index;
    while (left > 1 || right < this.totalFrames) {
      if (left > 1) {
        left--;
        if (this.frames[left]) return this.frames[left];
      }
      if (right < this.totalFrames) {
        right++;
        if (this.frames[right]) return this.frames[right];
      }
    }
    return null;
  }
}

export const heroFrameLoader = new SequenceFrameLoader('/images1', 300);
export const detailFrameLoader = new SequenceFrameLoader('/images2', 300);
