import { HandwritingData } from './aiAnalysisService';

const MODEL_URL = '/models/parkinsons-blstm/model.json';
const TIMESTEPS = 300;
const FEATURE_COUNT = 14;

class ParkinsonsBlstmInferenceService {
  private model: any = null;
  private loadAttempted = false;
  private tfPromise: Promise<any> | null = null;

  private async getTf(): Promise<any> {
    if (!this.tfPromise) {
      this.tfPromise = import('@tensorflow/tfjs');
    }
    return this.tfPromise;
  }

  private async ensureModelLoaded(): Promise<any | null> {
    if (this.model) return this.model;
    if (this.loadAttempted) return null;

    this.loadAttempted = true;
    try {
      const tf = await this.getTf();
      this.model = await tf.loadLayersModel(MODEL_URL);
      return this.model;
    } catch (error) {
      console.warn(
        `Parkinson BLSTM model not available at ${MODEL_URL}. Falling back to disease heuristic analysis.`,
        error
      );
      return null;
    }
  }

  private buildSequence(data: HandwritingData): number[][] {
    const allPoints = data.strokes.flatMap(stroke => stroke.points);
    if (!allPoints.length) {
      return Array.from({ length: TIMESTEPS }, () => Array(FEATURE_COUNT).fill(0));
    }

    const velocities: number[] = [];
    const accelerations: number[] = [];
    const jerks: number[] = [];
    const pressures: number[] = [];
    const curvature: number[] = [];
    const timeDeltas: number[] = [];

    for (let i = 1; i < allPoints.length; i++) {
      const p0 = allPoints[i - 1];
      const p1 = allPoints[i];
      const dt = Math.max(1, p1.timestamp - p0.timestamp);
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const dist = Math.hypot(dx, dy);
      const v = dist / dt;
      velocities.push(v);
      timeDeltas.push(dt);
      pressures.push(p1.pressure ?? 0);

      if (i >= 2) {
        const pPrev = allPoints[i - 2];
        const dtPrev = Math.max(1, p0.timestamp - pPrev.timestamp);
        const vPrev = Math.hypot(p0.x - pPrev.x, p0.y - pPrev.y) / dtPrev;
        const a = (v - vPrev) / dt;
        accelerations.push(a);

        if (i >= 3) {
          const pPrev2 = allPoints[i - 3];
          const dtPrev2 = Math.max(1, pPrev.timestamp - pPrev2.timestamp);
          const vPrev2 = Math.hypot(pPrev.x - pPrev2.x, pPrev.y - pPrev2.y) / dtPrev2;
          const aPrev = (vPrev - vPrev2) / dtPrev;
          jerks.push((a - aPrev) / dt);
        }
      }

      if (i >= 2) {
        const a = allPoints[i - 2];
        const b = allPoints[i - 1];
        const c = allPoints[i];
        const v1x = b.x - a.x;
        const v1y = b.y - a.y;
        const v2x = c.x - b.x;
        const v2y = c.y - b.y;
        const mag1 = Math.hypot(v1x, v1y);
        const mag2 = Math.hypot(v2x, v2y);
        if (mag1 > 0 && mag2 > 0) {
          const cos = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (mag1 * mag2)));
          curvature.push(Math.acos(cos));
        }
      }
    }

    const mean = (arr: number[]) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0);
    const std = (arr: number[]) => {
      if (arr.length < 2) return 0;
      const m = mean(arr);
      return Math.sqrt(arr.reduce((s, x) => s + (x - m) * (x - m), 0) / (arr.length - 1));
    };

    const bounds = allPoints.reduce(
      (acc, p) => ({
        minX: Math.min(acc.minX, p.x),
        maxX: Math.max(acc.maxX, p.x),
        minY: Math.min(acc.minY, p.y),
        maxY: Math.max(acc.maxY, p.y)
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    const width = Math.max(1, bounds.maxX - bounds.minX);
    const height = Math.max(1, bounds.maxY - bounds.minY);
    const aspectRatio = width / height;
    const pointDensity = allPoints.length / Math.max(1, width * height);
    const strokeCount = data.strokes.length;
    const avgStrokeLen = allPoints.length / Math.max(1, strokeCount);

    const featureVector = [
      mean(velocities),
      std(velocities),
      mean(accelerations),
      std(accelerations),
      mean(jerks),
      std(jerks),
      mean(pressures),
      std(pressures),
      mean(curvature),
      std(curvature),
      mean(timeDeltas),
      strokeCount,
      avgStrokeLen,
      aspectRatio + pointDensity
    ];

    return Array.from({ length: TIMESTEPS }, () => [...featureVector]);
  }

  async predictProbability(data: HandwritingData): Promise<number | null> {
    const model = await this.ensureModelLoaded();
    if (!model) return null;
    const tf = await this.getTf();

    const sequence = this.buildSequence(data);
    const input = tf.tensor3d([sequence], [1, TIMESTEPS, FEATURE_COUNT], 'float32');
    try {
      const prediction = model.predict(input);
      if (!prediction || Array.isArray(prediction)) return null;
      const output = prediction.dataSync()[0];
      if (Number.isNaN(output)) return null;
      return Math.max(0, Math.min(1, output));
    } finally {
      input.dispose();
    }
  }
}

export const parkinsonsBlstmInferenceService = new ParkinsonsBlstmInferenceService();
export default parkinsonsBlstmInferenceService;
