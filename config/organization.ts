/**
 * Configuração da Organização
 *
 * Para editar: modifique os valores abaixo
 * Para usar de uma API/DB no futuro: substitua este arquivo
 */

type LogoConfig =
  | { type: "emoji"; value: string }
  | { type: "initials"; value: string }
  | { type: "image"; value: string };

export const organizationConfig = {
  name: "IMeL Saúde",
  description: "Gerenciador de Liturgias",
  logo: {
    type: "emoji",
    value: "🎵",
  } as LogoConfig,
};

export type OrganizationConfig = typeof organizationConfig;
