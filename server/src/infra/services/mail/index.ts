import { env } from "@/config/env";
import { MailService, ProviderManager, TemplateEngine, createEmailProvider } from "./core";

const provider = new ProviderManager(await createEmailProvider());
const templateEngine = new TemplateEngine();
const from = env.MAIL_FROM;

const mailService = new MailService(
  provider,
  templateEngine,
  from
);

export default mailService