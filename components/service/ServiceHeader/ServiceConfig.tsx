import ColumnButtons from "@/components/config/ColumnButtons";
import DensityButtonSet from "@/components/config/DensityButtonSet";
import FontSizeButtonSet from "@/components/config/FontSizeButtonSet";
import ModeButtonSet from "@/components/config/ModeButtonSet";
import { useServiceConfig } from "@/components/config/ServiceConfig";
import { Label } from "@/components/ui/label";
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
    <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 bg-zinc-50">
      <div className="p-4 rounded-lg bg-zinc-100 border border-zinc-200">
        <h2 className="text-lg font-semibold text-primary pb-2">
          {t("Messages.config")}
        </h2>
        <div className="flex flex-col sm:flex-row sm:flex-wrap md:justify-start items-start gap-x-6 gap-y-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="column-count">{t("Messages.columns")}</Label>
            <ColumnButtons
              id="column-count"
              columns={columns}
              setColumns={setColumns}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="font-size">{t("Messages.fontSize")}</Label>
            <FontSizeButtonSet
              id="font-size"
              fontSize={fontSize}
              setFontSize={setFontSize}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="mode">{t("Messages.mode")}</Label>
            <ModeButtonSet id="mode" mode={mode} setMode={setMode} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="density">{t("Messages.density")}</Label>
            <DensityButtonSet density={density} setDensity={setDensity} />
          </div>
        </div>
      </div>
    </div>
  );
}
