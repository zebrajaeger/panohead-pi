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

const robot = new Robot();
server.event('robot.state');
server.event('robot.action');
robot.onStateChanged((newState: State, oldState: State) => {
    server.emit('robot.state', {newState, oldState})
})
robot.onShot((focusMs: number, triggerMs: number) => {
    server.emit('robot.action', {type: 'shot', focusMs, triggerMs})
    bridge.cameraStartShot(focusMs, triggerMs);
})
robot.onMoveTo((x: number, y: number) => {
    server.emit('robot.action', {type: 'move', x, y})
    bridge.stepperWritePos(0, x);
    bridge.stepperWritePos(1, y);
})
robot.onStop(() => {
    server.emit('robot.action', {type: 'stop'})
    bridge.stepperWriteVelocity(0, 0);
    bridge.stepperWriteVelocity(0, 1);
})

const panoCalc = new PanoCalc();
panoCalc.onPano(p => pano.setValue(p));

const timing = new PersistentValue<Timing>(server, config, wsNames.TIMING, {
    delayAfterMove: 0.0,
    delayBetweenShots: 0.0,
    delayAfterLastShot: 0.0
})
const shots = new PersistentValue<Shots>(server, config, wsNames.SHOTS, {shots:[{focusTime: 0.0, triggerTime: 1.0}]});
shots.onChange(s => {
    console.log('shots', s);
})
const imageFov = new PersistentValue<FOV>(server, config, wsNames.IMAGE_FOV, {a: {x: 0, y: 0}, b: {x: 0, y: 0}});
imageFov.onChange(v => panoCalc.imageFov = v)
const overlap = new PersistentValue<Overlap>(server, config, wsNames.OVERLAP, {x: 30, y: 30});
overlap.onChange(v => panoCalc.overlap = v)
const panoFov = new PersistentValue<PanoFOV>(server, config, wsNames.PANO_FOV, {
    a: {x: 0, y: 0},
    b: {x: 0, y: 0},
    partial: true
});
panoFov.onChange(v => panoCalc.panoFov = v)

// callbacks
server.register('joystickCalibrateAsTopLeft', () => bridge.joystickCalibrateAsTopLeft());
server.register('joystickCalibrateAsCenter', () => bridge.joystickCalibrateAsCenter());
server.register('joystickCalibrateAsBottomRight', () => bridge.joystickCalibrateAsBottomRight());
server.register('joystickSetBacklash', v => bridge.joystickSetBacklash(v.x1, v.x2, v.y1, v.y2));
server.register('panoStart', () => robot.start(pano.getValue(), timing.getValue(), shots.getValue()));
server.register('panoStop', () => robot.stop());
server.register('panoPauseResume', () => robot.pauseResume());
server.register('cameraStartFocus', (v) => bridge.cameraStartFocus(v.durationMs));
server.register('cameraStartTrigger', (v) => bridge.cameraStartTrigger(v.durationMs));
server.register('cameraStartShot', (v) => bridge.cameraStartShot(v.focusMs, v.triggerMs));

// bridge
setInterval(() => {
    try {
        const status = bridge.readStatus();
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
