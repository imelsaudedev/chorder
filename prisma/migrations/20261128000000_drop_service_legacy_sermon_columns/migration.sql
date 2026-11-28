-- Pregador, tema e texto vivem só no item Sermão do roteiro (lib/sermon-summary.ts).
-- Em produção (conferido em 27/11/2026, só leitura): sermonTheme e sermonReference estavam vazias e a
-- coluna preacher tinha 4 valores, todos já presentes (com o nome completo) nos itens Sermão.

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "preacher",
DROP COLUMN "sermonReference",
DROP COLUMN "sermonTheme";
