import { messagesSchema } from "./schema";

const lang = process.env.PUBLIC_LANG || "pt";

let messages;
if (lang === "en") {
  messages = require("./lang/en.json");
} else {
  messages = require("./lang/pt.json");
}

export default messagesSchema.parse(messages);
