import {FOV, Overlap, Pano, PanoFOV} from './wsInterface';
import {Optional} from 'typescript-optional';


export class PanoCalc {

    imageFov_: Optional<FOV> = Optional.empty();
    panoFov_: Optional<PanoFOV> = Optional.empty();
    overlap_: Optional<Overlap> = Optional.empty()

    listeners: ((pano: Pano) => void)[] = [];

    setImageFov(fov: FOV) {
        this.imageFov_ = Optional.ofNullable(fov);
        this.tryRecalculate();
    }

    set imageFov(fov: FOV) {
        this.setImageFov(fov);
    }

    setPanoFov(fov: PanoFOV) {
        this.panoFov_ = Optional.ofNullable(fov);
        this.tryRecalculate();
    }

    set panoFov(fov: PanoFOV) {
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
        console.log('tryRecalculate()', this.imageFov_.isPresent(), this.panoFov_.isPresent(), this.overlap_.isPresent())
        if (this.imageFov_.isPresent() && this.panoFov_.isPresent() && this.overlap_.isPresent()) {

            const fovi = this.imageFov_.get();
            if ((fovi.a.x === fovi.b.x) || (fovi.a.y === fovi.b.y)) {
                console.log('rejected', 'fovi.a.x === fovi.b.x', fovi.a.x === fovi.b.x, 'fovi.a.y === fovi.b.y', fovi.a.y === fovi.b.y)
                return;
            }

            const fovp = this.panoFov_.get();
            if ((fovp.a.y === fovp.b.y)) {
                console.log('rejected', 'fovp.a.y === fovp.b.y', fovp.a.y === fovp.b.y)
                return;
            }

            if (fovp.partial && (fovp.a.x === fovp.b.x)) {
                console.log('rejected', 'fovp.partial && (fovp.a.x === fovi.b.x)', fovp.partial && (fovp.a.x === fovi.b.x))
                return;
            }

            let pano = this.recalculate();
            this.listeners.forEach(listener => listener(pano))
        }
    }

    recalculate(): Pano {
        console.log('recalculate')
        // image
        const fovImage = this.imageFov_.get();
        let imageX = fovImage.a.x - fovImage.b.x;
        if (imageX < 0) imageX = -imageX;
        let imageY = fovImage.a.y - fovImage.b.y;
        if (imageY < 0) imageY = -imageY;

        // pano
        const fovPano = this.panoFov_.get();
        let panoX = fovPano.a.x - fovPano.b.x;
        if (panoX < 0) panoX = -panoX;
        let panoY = fovPano.a.y - fovPano.b.y;
        if (panoY < 0) panoY = -panoY;
        const offX = Math.min(fovPano.a.x, fovPano.b.x);
        const offY = Math.min(fovPano.a.y, fovPano.b.y);
        console.log({fovImage, imageX, imageY, fovPano, panoX, panoY, offX, offY})

        // overlap
        const overlap = this.overlap_.get();
        console.log({overlap})
        let isPartial = true;
        let xPositions: number[];
        let yPositions: number[];
        if (isPartial) {
            console.log('CALC-X-PARTIAL')
            xPositions = this.calculateSidePartial(imageX, panoX, overlap.x / 100);
            console.log('CALC-Y-PARTIAL')
            yPositions = this.calculateSidePartial(imageY, panoY, overlap.y / 100);
            //yPositions = this.calculateSide360(imageY, panoY, overlap.y / 100);
        } else {
            console.log('CALC-X-FULL')
            xPositions = this.calculateSide360(imageX, panoX, overlap.x/100);
            console.log('CALC-Y-FULL')
            yPositions = this.calculateSidePartial(imageY, panoY, overlap.y / 100);
        }
        return {x: xPositions.map(v => v + offX), y: yPositions.map(v => v + offY)};
    }

    calculateSidePartial(imageLength: number, panoLength: number, minOverlap: number): number[] {
        console.log('calculateSidePartial()', {imageLength, panoLength, minOverlap})
        let n1 = (panoLength - imageLength) / (imageLength * (1 - minOverlap));
        let n2 = Math.ceil(n1);
        let n3 = n2 + 1;
        console.log({n1, n2, n3});
        let result: number[] = [];
        for (let i = 0; i < n3; ++i) {
            let from = i * ((panoLength-imageLength) / n2);
            let to = from + imageLength;
            result.push(from);
            console.log({i,from,to})
        }

        let overlap = n3 * imageLength - panoLength;
        let imageOverlap = overlap / (n3 - 1)
        let imageOverlapRel = imageOverlap / imageLength

        console.log({overlap, imageOverlap, imageOverlapRel, result})
        return result;
    }

    calculateSide360(imageLength: number, panoLength: number, minOverlap: number): number[] {
        console.log('calculateSide360()', {imageLength, panoLength, minOverlap})
        let n1 = panoLength / (imageLength * (1 - minOverlap));
        let n2 = Math.ceil(n1);
        let n3 = n2;
        console.log({n1, n2, n3});
        let result: number[] = [];
        for (let i = 0; i < n3; ++i) {
            let from = i * (panoLength / n2);
            let to = from + imageLength;
            result.push(from);
            console.log({i,from,to})
        }

        let overlap = n3 * imageLength - panoLength;
        let imageOverlap = overlap / (n3 - 1)
        let imageOverlapRel = imageOverlap / imageLength

        console.log({overlap, imageOverlap, imageOverlapRel, result})
        return result;
    }
}

//let c = new PanoCalc();
//let r = c.calculateSide360(100, 300, 0.30);
//console.log(r);