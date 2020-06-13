import {FOV, Overlap, Pano} from './wsInterface';
import {Optional} from 'typescript-optional';


export class PanoCalc {

    imageFov_: Optional<FOV> = Optional.empty();
    panoFov_: Optional<FOV> = Optional.empty();
    overlap_: Optional<Overlap> = Optional.empty()

    listeners: ((pano: Pano) => void)[] = [];

    setImageFov(fov: FOV) {
        this.imageFov_ = Optional.ofNullable(fov);
        this.tryRecalculate();
    }

    set imageFov(fov: FOV){
        this.setImageFov(fov);
    }

    setPanoFov(fov: FOV) {
        this.panoFov_ = Optional.ofNullable(fov);
        this.tryRecalculate();
    }

    set panoFov(fov: FOV){
        this.setPanoFov(fov);
    }

    setOverlap(overlap: Overlap) {
        this.overlap_ = Optional.ofNullable(overlap);
        this.tryRecalculate();
    }

    set overlap(overlap: Overlap) {
        this.setOverlap(overlap);
    }

    onPano(cb: (pano: Pano) => void) {
        this.listeners.push(cb);
    }

    tryRecalculate(): void {
        if (this.imageFov_.isPresent() && this.panoFov_.isPresent() && this.overlap_.isPresent()) {
            let pano = this.recalculate();
            this.listeners.forEach(listener => listener(pano))
        }
    }

    recalculate(): Pano {
        // image
        const fovi = this.imageFov_.get();
        let ix = fovi.a.x - fovi.b.x;
        if (ix < 0) ix = -ix;
        let iy = fovi.a.y - fovi.b.y;
        if (iy < 0) iy = -iy;

        // pano
        const fovp = this.panoFov_.get();
        let px = fovp.a.x - fovp.b.x;
        if (px < 0) px = -px;
        let py = fovp.a.y - fovp.b.y;
        if (py < 0) py = -py;
        const offX = Math.min(fovp.a.x, fovp.b.x);
        const offY = Math.min(fovp.a.y, fovp.b.y);

        // overlap
        const ol = this.overlap_.get();
        let isPartial = true;
        let xPositions: number[];
        let yPositions: number[];
        if (isPartial) {
            xPositions = this.calculateSidePartial(ix, px, ol.x);
            yPositions = this.calculateSidePartial(iy, py, ol.y);
        } else {
            xPositions = this.calculateSide360(ix, px, ol.x);
            yPositions = this.calculateSidePartial(iy, py, ol.y);
        }
        return {x: xPositions.map(v => v + offX), y: yPositions.map(v => v + offY)};
    }

    calculateSidePartial(imageLength: number, panoLength: number, minOverlap: number): number[] {
        let overlapRel = -1;
        let overlapLength = 0;
        let n = 1;
        for (; overlapRel < minOverlap; n++) {
            //console.log(`--------- ${n} ----------`)
            let imageLengthSum = imageLength * n;
            let overlapSum = imageLengthSum - panoLength;
            //console.log('imageLengthSum', imageLengthSum);
            //console.log('overlapSum', overlapSum);

            overlapLength = overlapSum / (n - 1);
            overlapRel = overlapLength / imageLength;
            //console.log('overlapLength', overlapLength);
            //console.log('overlapRel', overlapRel);
        }

        let partialImageLength = imageLength - overlapLength;
        let result: number[] = [];
        for (let i = 1; i < n; ++i) {
            result.push((i - 1) * partialImageLength);
        }

        return result;
    }

    calculateSide360(imageLength: number, panoLength: number, minOverlap: number): number[] {
        let overlapRel = -1;
        let overlapLength = 0;
        let n = 1;
        for (; overlapRel < minOverlap; n++) {
            //console.log(`--------- ${n} ----------`)
            let imageLengthSum = imageLength * n;
            let overlapSum = imageLengthSum - panoLength;
            // console.log('imageLengthSum', imageLengthSum);
            //console.log('overlapSum', overlapSum);

            overlapLength = overlapSum / n;
            overlapRel = overlapLength / imageLength;
            // console.log('overlapLength', overlapLength);
            //console.log('overlapRel', overlapRel);
        }

        let partialImageLength = imageLength - overlapLength;
        let result: number[] = [];
        for (let i = 1; i < n; ++i) {
            result.push((i - 1) * partialImageLength);
        }

        return result;
    }
}

//let c = new PanoCalc();
//let r = c.calculateSide360(100, 300, 0.30);
//console.log(r);