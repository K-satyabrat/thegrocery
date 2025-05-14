import { Resend } from "resend";
import { configDotenv } from "dotenv";
configDotenv();

const resend = new Resend(process.env.RESEND_API);

export const sendEmail = async ({ name, sendTo, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "thegrocery <onboarding@resend.dev>",
      to: sendTo,
      subject: subject,
      html: html,
    });
    if (error) {
      console.log(error);
    }
    return data;
  } catch (errot) {
    console.error({ error: errror.message });
  }
};


