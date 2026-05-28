import { useMakeArrangementDefault } from "#api-client";
import Heading from "@/components/common/Heading";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import MoveArrangementButton from "./MoveArrangementButton";

type ArrangementInfoFormProps = {
  arrangementId?: number;
  songSlug?: string;
  isDefault: boolean;
  fieldPrefix?: string;
};
export default function ArrangementInfoForm({
  arrangementId,
  songSlug,
  isDefault,
  fieldPrefix = "",
}: ArrangementInfoFormProps) {
  const { control } = useFormContext();
  const { makeArrangementDefault } = useMakeArrangementDefault(
    arrangementId || 0
  );
  const handleMakeArrangementDefault = () => {
    makeArrangementDefault();
  };

  const t = useTranslations();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-zinc-50">
      {/* Heading + Botões abaixo no mobile, à direita no sm */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <Heading level={2}>{t("SongData.arrangementSettings")}</Heading>

        {/* Botões alinhados à esquerda no mobile e à direita no sm */}
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleMakeArrangementDefault}
            disabled={isDefault}
          >
            {isDefault
              ? t("SongData.alreadyDefault")
              : t("SongData.makeDefault")}
          </Button>

          {arrangementId && (
            <MoveArrangementButton
              arrangementId={arrangementId}
              songSlug={songSlug}
            />
          )}
        </div>
      </div>

      {/* Campos lado a lado a partir de sm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <FormField
          control={control}
          name={`${fieldPrefix}name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary mb-2">
                {t("SongData.arrangementName")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={`${t("Messages.arrangement")} ${arrangementId}`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${fieldPrefix}key`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary mb-2">
                {t("SongData.defaultKey")}
              </FormLabel>
              <FormControl>
                <Input placeholder={t("SongData.keyPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
