import {Server} from 'rpc-websockets';
import {ServerValue} from '@zebrajaeger/ws-value';
import Configstore from 'configstore';

export class PersistentValue<T> extends ServerValue<T> {
    constructor(server: Server, private configStore: Configstore, name: string, initialValue: T) {
        super(server, name);
        this.setValue(configStore.get(name) || initialValue);
        this.onChange(v => configStore.set(name, v));
    }
}