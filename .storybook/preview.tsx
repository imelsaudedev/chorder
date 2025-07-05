import type { Preview } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import {
  bricolageGrotesque,
  ibmPlexMono,
  ibmPlexSans,
  ibmPlexSerif,
} from "../app/fonts";
import "../app/globals.css";
import en from "../i18n/messages/en.json";
import pt from "../i18n/messages/pt-BR.json";

const preview: Preview = {
  globalTypes: {
    locale: {
      description: "Internationalization locale",
      defaultValue: "pt",
      toolbar: {
        icon: "globe",
        items: [
          { value: "pt-BR", right: "🇧🇷", title: "Português" },
          { value: "en-US", right: "🇺🇸", title: "English" },
        ],
      },
    },
  },

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },

    nextjs: {
      appDirectory: true,
    },
  },

  decorators: [
    (Story, context) => {
      const locale = context.globals.locale;
      const messages =
        {
          "pt-BR": pt,
          "en-US": en,
        }[locale] || pt;

      return (
        <div
          className={`${ibmPlexSans.variable} ${ibmPlexSerif.variable} ${ibmPlexMono.variable} ${bricolageGrotesque.variable} font-sans`}
        >
          <NextIntlClientProvider
            locale={locale}
            messages={messages}
            timeZone="America/Sao_Paulo"
          >
            <Story />
          </NextIntlClientProvider>
        </div>
      );
    },
  ],
};

export default preview;
