declare module "nodemailer" {
  import { Transporter } from "nodemailer/lib/mailer";

  export function createTransport(options: nodemailer.TransportOptions): Transporter;
}