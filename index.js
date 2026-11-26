const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const express = require('express');
const pino = require('pino');
const QRCode = require('qrcode');
const app = express();
const PORT = process.env.PORT || 3000;

let lastQR = '';

app.get('/', (req, res) => res.send('Bot is running - Go to /qr to scan'));
app.get('/qr', async (req, res) => {
  if (!lastQR) return res.send('No QR yet, wait 10 seconds and refresh this page');
  const img = await QRCode.toDataURL(lastQR);
  res.send(`<h2>Scan this with WhatsApp</h2><img src="${img}" style="width:300px"><br><br><button onclick="location.reload()">Refresh QR</button>`);
});
app.listen(PORT, () => console.log('Server running'));

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Alex Bot', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      lastQR = qr;
      console.log('New QR generated, go to /qr to scan');
    }
    if (connection === 'close') {
      console.log('Disconnected, waiting 10s...');
      setTimeout(() => start(), 10000);
    }
    if (connection === 'open') {
      console.log('Client is ready! Bot don connect!');
      lastQR = '';
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const from = msg.key.remoteJid;
    const reply = (t) => sock.sendMessage(from, { text: t });
    const cmd = text.toLowerCase().trim();
    if (cmd === '.menu' || cmd === '.help') return reply('Menu: .hi .ping .time .date .joke');
    if (cmd === '.hi') return reply('Wagwan! I be Alex Bot');
    if (cmd === '.ping') return reply('Pong! Bot dey alive');
    if (cmd === '.time') return reply('Time: ' + new Date().toLocaleTimeString());
    if (cmd === '.date') return reply('Date: ' + new Date().toDateString());
    if (cmd === '.joke') return reply('Why computer go doctor? E get virus!');
  });
}
start();
