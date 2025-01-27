import { client, whatsappClient } from "../../config/twilio.js";

export const sendSMS = async ({ to, body }) => {
    try {
        const message = await client.messages.create({
            from: process.env.TWILIO_FROM_NO,
            to,
            body,
        });
        console.log(`Message sent successfully. SID: ${message.sid}`);
        return true;
    } catch (error) {
        console.error(`ERROR IN sendSMS :- Failed to send message: ${error.message}`);
        return false;
    }
};

export const sendWhatsapp = async ({ to, body }) => {
    try {
        const message = await whatsappClient.messages.create({
            from: process.env.TWILIOWHATSAPP_FROM_NO,
            to:`whatsapp:${to}`,
            body,
        });
        console.log(`Message sent on Whatsapp successfully. SID: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error(`ERROR IN sendWhatsapp :- Failed to send message on Whatsapp: ${error.message}`,error);
        return { success: false, error: error.message };
    }
};
