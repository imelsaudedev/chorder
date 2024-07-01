import { Locale } from 'date-fns';
import { messagesSchema } from './schema';

const lang = process.env.PUBLIC_LANG || 'pt';
let locale: Locale;

let messages;
if (lang === 'en') {
  messages = require('./lang/en.json');
  locale = require('date-fns/locale/en-US').enUS;
} else {
  messages = require('./lang/pt.json');
  locale = require('date-fns/locale/pt-BR').ptBR;
}

export default messagesSchema.parse(messages);
export const dateLocale = locale;

export function format(message: string, values: Record<string, string>) {
  // Replace all {key} with values[key]
  return message.replace(/{([^}]+)}/g, (_, key) => values[key]);
}
