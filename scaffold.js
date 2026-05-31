const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const backendSrc = path.join(rootDir, 'backend', 'src');
const frontendSrc = path.join(rootDir, 'frontend', 'src');

const backendOldDirs = ['docs', 'infrastructure', 'presentation', 'shared'];
const frontendOldDirs = ['app', 'assets', 'components', 'config', 'constants', 'contexts', 'features', 'hooks', 'layouts', 'middleware', 'pages', 'routes', 'services', 'store', 'styles', 'types', 'utils'];

// Clean up old backend folders
backendOldDirs.forEach(dir => {
    const fullPath = path.join(backendSrc, dir);
    if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
    }
});

// Clean up old frontend folders
frontendOldDirs.forEach(dir => {
    const fullPath = path.join(frontendSrc, dir);
    if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
    }
});

const modules = ['auth', 'alumni', 'registrar', 'tracer-study', 'employer', 'analytics', 'notification'];

// Backend Modules Structure
const backendStructure = [
    'domain/entities',
    'domain/value-objects',
    'domain/events',
    'domain/errors',
    'application/use-cases',
    'application/ports',
    'application/dto',
    'infrastructure/repositories',
    'infrastructure/storage',
    'infrastructure/services',
    'presentation/controllers',
    'presentation/routes',
    'presentation/validators',
    'tests'
];

modules.forEach(mod => {
    backendStructure.forEach(folder => {
        const fullPath = path.join(backendSrc, 'modules', mod, folder);
        fs.mkdirSync(fullPath, { recursive: true });
    });
});

// Backend Core Structure
const coreFolders = ['config', 'errors', 'middleware', 'types', 'utils'];
coreFolders.forEach(folder => {
    fs.mkdirSync(path.join(backendSrc, 'core', folder), { recursive: true });
});

// Frontend Feature Structure
const frontendStructure = [
    'api',
    'components',
    'hooks',
    'pages',
    'store',
    'types',
    'tests'
];

modules.forEach(mod => {
    frontendStructure.forEach(folder => {
        fs.mkdirSync(path.join(frontendSrc, 'features', mod, folder), { recursive: true });
    });
});

// Frontend Shared and App Structure
const sharedFolders = ['api', 'components', 'hooks', 'utils', 'types'];
sharedFolders.forEach(folder => {
    fs.mkdirSync(path.join(frontendSrc, 'shared', folder), { recursive: true });
});

const appFolders = ['router', 'store', 'styles'];
appFolders.forEach(folder => {
    fs.mkdirSync(path.join(frontendSrc, 'app', folder), { recursive: true });
});

console.log('Clean Architecture folders scaffolded successfully!');
