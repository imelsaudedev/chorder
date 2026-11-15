const path = require('path');
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/index.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  // Garante que o Prisma Client gerado seja incluído no bundle de toda função
  // serverless, independente do que o rastreamento automático de arquivos do
  // Next detectar — evita rotas ficarem com um client desatualizado/incompleto
  // depois de mudanças no schema (visto em produção após adicionar HolyricsConfig).
  outputFileTracingIncludes: {
    '/**/*': ['./node_modules/.prisma/client/**/*'],
  },
};

module.exports = withNextIntl(nextConfig);
