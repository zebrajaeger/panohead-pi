import {Server} from 'rpc-websockets';
import {ServerValue} from '@zebrajaeger/ws-value';
import {openSync} from 'i2c-bus';
import {Bridge} from './bridge';
import Configstore from 'configstore';
import {FOV, Overlap, Pano, PanoFOV, Shots, Timing, wsNames, Status} from './wsInterface';
import {PanoCalc} from './panocalc';
import {PersistentValue} from './persistentvalue';
import {Robot, State} from './robot';

const log4js = require("log4js");
const LOG = log4js.getLogger('server');
LOG.level = "debug";
const config = new Configstore('test');

const i2c = openSync(1);
const bridge = new Bridge(i2c, 0x45);

// values
const server = new Server({port: 8081, host: '0.0.0.0'});
const svStatus = new ServerValue<Status>(server, wsNames.STATUS);
const jogging = new ServerValue<boolean>(server, wsNames.JOGGING);
const pano = new PersistentValue<Pano>(server, config, wsNames.PANO, {x: [], y: []});
const robotState = new ServerValue<string>(server, wsNames.ROBOT_STATE);

let isMoving = false;
let isCameraActive = false;

const robot = new Robot();
server.event('robot.action');
robot.onStateChanged((newState: State, oldState: State) => {
    robotState.setValue(State[newState]);
})
robot.onShot((focusMs: number, triggerMs: number) => {
    LOG.info(`take shot ${focusMs} ${triggerMs}`)
    isCameraActive = true;
    server.emit('robot.action', {type: 'shot', focusMs, triggerMs})
    bridge.cameraStartShot(focusMs, triggerMs);
})
robot.onMoveTo((x: number, y: number) => {
    LOG.info(`move to ${x} ${y}`)
    server.emit('robot.action', {type: 'move', x, y})
    isMoving = true
    bridge.stepperWritePos(0, x);
    bridge.stepperWritePos(1, y);
})
robot.onStop(() => {
    LOG.info(`stop`)
    server.emit('robot.action', {type: 'stop'})
    bridge.stepperWriteVelocity(0, 0);
    bridge.stepperWriteVelocity(0, 1);
})
robotState.setValue(State[State.INITIALIZED]);

const panoCalc = new PanoCalc();
panoCalc.onPano(p => pano.setValue(p));
panoCalc.onPano(p => console.log(p));

const timing = new PersistentValue<Timing>(server, config, wsNames.TIMING, {
    delayAfterMove: 0.0,
    delayBetweenShots: 0.0,
    delayAfterLastShot: 0.0
})

const shots = new PersistentValue<Shots>(server, config, wsNames.SHOTS, new Shots([{
    focusTime: 0.0,
    triggerTime: 1.0
}]));

const imageFov = new PersistentValue<FOV>(server, config, wsNames.IMAGE_FOV, {a: {x: 0, y: 0}, b: {x: 0, y: 0}});
panoCalc.imageFov = imageFov.getValue();
imageFov.onChange(v => panoCalc.imageFov = v)

const overlap = new PersistentValue<Overlap>(server, config, wsNames.OVERLAP, {x: 30, y: 30});
panoCalc.overlap = overlap.getValue();
overlap.onChange(v => panoCalc.overlap = v)

const panoFov = new PersistentValue<PanoFOV>(server, config, wsNames.PANO_FOV, {
    a: {x: 0, y: 0},
    b: {x: 0, y: 0},
    partial: true
});
panoCalc.panoFov = panoFov.getValue();
panoFov.onChange(v => panoCalc.panoFov = v)

// callbacks
server.register('joystickCalibrateAsTopLeft', () => bridge.joystickCalibrateAsTopLeft());
server.register('joystickCalibrateAsCenter', () => bridge.joystickCalibrateAsCenter());
server.register('joystickCalibrateAsBottomRight', () => bridge.joystickCalibrateAsBottomRight());
server.register('joystickSetBacklash', v => bridge.joystickSetBacklash(v.x1, v.x2, v.y1, v.y2));
server.register('panoStart', () => {
    robot.start(pano.getValue(), timing.getValue(), shots.getValue());
});
server.register('panoStop', () => robot.stop());
server.register('panoPauseResume', () => robot.pauseResume());
server.register('cameraStartFocus', (v) => bridge.cameraStartFocus(v.durationMs));
server.register('cameraStartTrigger', (v) => bridge.cameraStartTrigger(v.durationMs));
server.register('cameraStartShot', (v) => bridge.cameraStartShot(v.focusMs, v.triggerMs));

setInterval(() => {
    try {
        const status = bridge.readStatus();

        let m = status.actor.x.isMoving || status.actor.y.isMoving;
        if(isMoving && !m){
            robot.triggerPositionReached();
        }
        isMoving = m;

        let s = status.camera.focus || status.camera.trigger;
        if(isCameraActive && !s ){
            robot.triggerShotDone();
        }
        isCameraActive = s;

        //console.log(status.actor.x.isMoving)
        svStatus.setValue(status);
        if (jogging.getValueOr(false)) {
            bridge.stepperWriteVelocity(0, status.joystick.x);
            bridge.stepperWriteVelocity(1, status.joystick.y);
        }
    } catch (err) {
        console.error(err);
    }
}, 20);

LOG.info('Server started');
