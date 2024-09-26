require('dotenv').config()
const {Telegraf, Scenes, session} = require('telegraf');
const express = require('express');
const {books} = require("./products");
const {sendInvoice} = require("./functions");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.use(session());

bot.start(async (ctx) => {
    let message = 'O\'zbek adabiyotidagi kitoblar ro\'yhati:';
    await ctx.reply(message)
    for (const book of books) {
        await sendInvoice(ctx, book);
    }
});

bot.on('pre_checkout_query', (ctx) => {
    ctx.answerPreCheckoutQuery(true);
});

bot.on('successful_payment', async (ctx) => {
    const paymentInfo = ctx.message.successful_payment;
    const tariffId = paymentInfo.invoice_payload.split('-')[1];

    const chosenTariff = books.find(book => book.id === parseInt(tariffId));
    if (chosenTariff) {
        await ctx.reply(`💳 Toʻlov muvaffaqiyatli amalga oshirildi! \\n 🎉 Sizning kitobingiz ${chosenTariff.author} ning ${chosenTariff.title} kitobi ✅ `);
    } else {
        ctx.reply('Xato: Tanlangan tarif topilmadi.');
    }
});

const app = express();
const port = process.env.PORT || 9090; // Default port for Render.com services

// Endpoint to respond to HTTP requests (for UptimeRobot)
app.get('/', (req, res) => {
    res.send('Bot is running...');
});

app.listen(port, function () {
    bot.launch();
    console.log('Express server listening on port ' + port);
});

app.on('error', onError);

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

const shutdown = async (val) => {
    console.log('Shutting down gracefully...');

    try {
        await bot.stop(val);
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

console.log('Bot is running...');

