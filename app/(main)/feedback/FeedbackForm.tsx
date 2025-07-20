"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { BugIcon, CircleEllipsisIcon, LightbulbIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { useActionState, useMemo } from "react";
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import z from "zod";
import { postFeedback } from "./actions";

export default function FeedbackForm() {
  const t = useTranslations("Feedback");

  const formSchema = z.object({
    type: z.enum(["bug", "feature", "other"]),
    author: z.string().optional(),
    content: z.string().min(1, t("contentRequired")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "bug",
      author: "",
      content: "",
    },
  });

  const [formState, formAction, formPending] = useActionState(postFeedback, {
    success: false,
  });

  const selectedType = form.watch("type");

  const contentLabel = useMemo(() => {
    switch (selectedType) {
      case "bug":
        return t("contentBug");
      case "feature":
        return t("contentFeature");
      case "other":
        return t("contentOther");
      default:
        return "";
    }
  }, [selectedType, t]);

  if (formState.success) {
    return redirect("/feedback/success");
  }

  return (
    <div className="w-full max-w-sm">
      <Form {...form}>
        <form className="space-y-4" action={formAction}>
          <FeedbackTypeSelector
            feedbackType={form.register("type")}
            selectedType={selectedType}
          />
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("nameLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("namePlaceholder")} {...field} />
                </FormControl>
                <FormDescription>{t("nameDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{contentLabel}</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {formState.error && (
            <p className="text-red-500 text-sm mt-2">
              {formState.error || t("serverError")}
            </p>
          )}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={formPending || !form.formState.isValid}
            >
              {t("submit")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

type FeedbackTypeSelectorProps = {
  feedbackType: UseFormRegisterReturn<"type">;
  selectedType: "bug" | "feature" | "other";
};
function FeedbackTypeSelector({
  feedbackType,
  selectedType,
}: FeedbackTypeSelectorProps) {
  const t = useTranslations("Feedback");

  return (
    <div className="grid grid-cols-3 gap-1">
      <FeedbackButton
        feedbackType={feedbackType}
        value="bug"
        isSelected={selectedType === "bug"}
      >
        <BugIcon className="size-12" />
        {t("bug")}
      </FeedbackButton>
      <FeedbackButton
        feedbackType={feedbackType}
        value="feature"
        isSelected={selectedType === "feature"}
      >
        <LightbulbIcon className="size-12" />
        {t("feature")}
      </FeedbackButton>
      <FeedbackButton
        feedbackType={feedbackType}
        value="other"
        isSelected={selectedType === "other"}
      >
        <CircleEllipsisIcon className="size-12" />
        {t("other")}
      </FeedbackButton>
    </div>
  );
}

type FeedbackButtonProps = {
  value: "bug" | "feature" | "other";
  feedbackType: UseFormRegisterReturn<"type">;
  isSelected: boolean;
  children?: React.ReactNode;
};
function FeedbackButton({
  children,
  feedbackType,
  isSelected,
  value,
}: FeedbackButtonProps) {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className="flex"
      asChild
    >
      <label
        htmlFor={`field-${value}`}
        className="flex flex-col items-center gap-2 h-auto py-6 text-xs"
      >
        <input
          {...feedbackType}
          type="radio"
          value={value}
          id={`field-${value}`}
          className="hidden"
        />
        {children}
      </label>
    </Button>
  );
}
