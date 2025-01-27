import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const whatsappAccountSid = process.env.TWILIOWHATSAPP_ACCOUNT_SID;
const whatsappAuthToken = process.env.TWILIOWHATSAPP_AUTH_TOKEN;

export const client = twilio(accountSid, authToken);
export const whatsappClient = twilio(whatsappAccountSid, whatsappAuthToken);
