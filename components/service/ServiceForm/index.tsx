import { useCreateOrUpdateService } from "#api-client";
import PageHeader from "@/components/common/PageHeader";
import SaveButtonSet from "@/components/common/SaveButtonSet";
import { Form } from "@/components/ui/form";
import { ClientService } from "@/prisma/models";
import { serviceSchema, ServiceSchema } from "@/schemas/service";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useForm, useFormState } from "react-hook-form";
import ServiceInfoForm from "./ServiceInfoForm";
import ServiceUnitListForm from "./ServiceUnitListForm";
import { initForm } from "./useServiceForm";

type ServiceFormProps = {
  service: ClientService | null;
  onSaved?: (service: ClientService) => void;
};

export default function ServiceForm({ service, onSaved }: ServiceFormProps) {
  const t = useTranslations("Messages");

  const form = useForm<ServiceSchema>(initForm(service));
  const { isDirty, isValid } = useFormState({ control: form.control });

  try {
    serviceSchema.parse(form.getValues());
  } catch (error) {
    console.log("Invalid service data:", error);
  }

  const searchParams = useSearchParams().toString();
  const pathname = usePathname().replace("/edit", "");
  const cancelUrl = `${pathname}${searchParams ? `?${searchParams}` : ""}`;

  const { createOrUpdateService } = useCreateOrUpdateService(
    service?.id ?? null
  );

  async function onSubmit(service: ClientService) {
    const newOrUpdatedService = await createOrUpdateService(service);
    if (onSaved) {
      onSaved(newOrUpdatedService);
    }
  }
  const isNew = !service?.id;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PageHeader
          title={isNew ? t("newService") : t("editService")}
          actions={
            <SaveButtonSet
              cancelUrl={isNew ? undefined : cancelUrl}
              enabled={isDirty && isValid}
            />
          }
          variant="edit"
        />
        <ServiceInfoForm />
        <ServiceUnitListForm />
      </form>
    </Form>
  );
}
