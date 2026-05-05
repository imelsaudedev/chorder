import { beforeAll, beforeEach } from 'vitest';
import { clearDatabase } from './tests/integration-utils';

beforeAll(async () => {
    // Additional setup if needed
});

beforeEach(async () => {
    await clearDatabase();
});
