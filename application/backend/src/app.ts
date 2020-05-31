// import {Server} from 'rpc-websockets';
// import {ServerValue} from '@zebrajaeger/ws-value';
// import Configstore from 'configstore';

import {openSync} from 'i2c-bus';

enum Commands {
    writeLimit = 0,

    writeVelocity = 20,
    writePos = 21,

    readPos = 50,
    readIsMoving = 51,

    unknown = 127
}

function i2cSend(a: number[]): number {
    const buffer = Buffer.from(a);
    return i2c.i2cWriteSync(0x45, buffer.length, buffer);
}

const i2c = openSync(1);
i2cSend([Commands.writePos, 123]);

i2c.closeSync();


// const config = new Configstore('test');
// console.log(config.get('foo'));
// config.get('timing')

// interface Timing {
//     delayAfterMove: number;
//     delayBetweenShots: number;
//     delayAfterLastShot: number;
// }
//
// interface Shot {
//     focusTime: number;
//     triggerTime: number;
// }
//
// class PersistentValue<T> extends ServerValue<T> {
//     constructor(server: Server, private configStore: Configstore, name: string, initialValue: T) {
//         super(server, name);
//         this.setValue(configStore.get(name) || initialValue);
//         this.onChange(v => configStore.set(name, v));
//     }
// }
//
// const server = new Server({port: 8081, host: '0.0.0.0'});
// const TIMING = 'timing';
// const SHOTS = 'shots';
// const values = {
//     TIMING: new PersistentValue<Timing>(server, config, TIMING, {
//         delayAfterMove: 0.0,
//         delayBetweenShots: 0.0,
//         delayAfterLastShot: 0.0
//     }),
//     SHOTS: new PersistentValue<Shot[]>(server, config, SHOTS, [{focusTime: 0.0, triggerTime: 1.0}])
// };
