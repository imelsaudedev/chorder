import ColumnButtons from "@/components/config/ColumnButtons";
import DensityButtonSet from "@/components/config/DensityButtonSet";
import FontSizeButtonSet from "@/components/config/FontSizeButtonSet";
import ModeButtonSet from "@/components/config/ModeButtonSet";
import { useServiceConfig } from "@/components/config/ServiceConfig";
import { useTranslations } from "next-intl";

export default function ServiceConfig() {
  const t = useTranslations();
  const {
    columns,
    setColumns,
    fontSize,
    setFontSize,
    mode,
    setMode,
    density,
    setDensity,
  } = useServiceConfig();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-primary">{t("Messages.display")}</p>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-zinc-500">{t("Messages.mode")}</span>
        <ModeButtonSet mode={mode} setMode={setMode} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-zinc-500">{t("Messages.columns")}</span>
        <ColumnButtons id="service-column-count" columns={columns} setColumns={setColumns} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-zinc-500">{t("Messages.fontSize")}</span>
        <FontSizeButtonSet fontSize={fontSize} setFontSize={setFontSize} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-zinc-500">{t("Messages.density")}</span>
        <DensityButtonSet density={density} setDensity={setDensity} />
      </div>
    </div>
  );
}
