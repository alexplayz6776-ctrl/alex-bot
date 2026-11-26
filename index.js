const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const pino = require('pino');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(PORT, () => console.log('Server running on ' + PORT));

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Alex Bot', 'Chrome', '1.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            console.log('Disconnected, restarting...');
            start();
        }
        if (connection === 'open') {
            console.log('Client is ready! Bot don connect!');
        }
    });

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode('2348132560943');
                console.log('PAIRING CODE: ' + code);
            } catch (e) {
                console.log('Pairing error: ' + e.message);
            }
        }, 3000);
    }

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const from = msg.key.remoteJid;
        const reply = (t) => sock.sendMessage(from, { text: t });
        const cmd = text.toLowerCase().trim();
        if (cmd === '.menu' || cmd === '.help') return reply('Commands: .hi .ping .time .date .joke');
        if (cmd === '.hi') return reply('Wagwan! I be Alex Bot 🤖');
        if (cmd === '.ping') return reply('Pong! Bot dey alive 🔥');
        if (cmd === '.time') return reply('Time: ' + new Date().toLocaleTimeString());
        if (cmd === '.date') return reply('Date: ' + new Date().toLocaleDateString());
        if (cmd === '.joke') return reply('Why computer go doctor? Because e get virus 😂');
    });
}
start();
