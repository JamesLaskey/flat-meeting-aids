import type { RecordOf } from 'immutable';
import type { AccessSystem } from '../access';
import type { World, WorldUpdates } from './world'

export class TestWorld implements World {
    access: AccessSystem;
    storage: Storage;
    broadcast: Broadcast;
    logger: Logger;
    applyUpdate(updates: RecordOf<WorldUpdates>): Error | undefined {
        throw new Error('Method not implemented.');
    }
}