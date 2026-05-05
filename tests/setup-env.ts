import { loadEnvConfig } from '@next/env';
import fs from 'fs';
import path from 'path';

// 1. Load standard environment variables
loadEnvConfig(process.cwd());

// 2. Override with .env.test specifically for isolation
const envTestPath = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(envTestPath)) {
    const envConfig = fs.readFileSync(envTestPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

// 3. Force reset Prisma global to ensure clean initialization
(global as any).prisma = undefined;
