const { getDefaultConfig } = require("expo/metro-config");

// Desde o SDK 52, o Metro detecta monorepo pnpm automaticamente (não precisa
// configurar watchFolders/nodeModulesPaths manualmente). Se aparecer erro do
// tipo "Unable to resolve module @organizalar/contracts", o fallback é
// habilitar `nodeLinker: hoisted` no pnpm-workspace.yaml (raiz do monorepo).
module.exports = getDefaultConfig(__dirname);
