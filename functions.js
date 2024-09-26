require('dotenv').config()

const sendInvoice = async (ctx, tariff) => {
    return ctx.replyWithInvoice({
        chat_id: ctx.chat.id,
        title: tariff.title,
        description: tariff.author,
        payload: `subscription-${tariff.id}`,
        provider_token: process.env.CLICK_TEST_TOKEN,
        currency: 'UZS',
        prices: [{ label: tariff.title, amount: tariff.price * 100 }],
        start_parameter: 'get-access',
        need_phone_number: true,
    });
};

module.exports = {sendInvoice}