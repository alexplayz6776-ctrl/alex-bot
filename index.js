const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u) => {
    if (u.qr) qrcode.generate(u.qr, {small:true});
    if (u.connection === 'close') startBot();
    if (u.connection === 'open') console.log('Alex Bot don connect!');
  });
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const from = msg.key.remoteJid;
    const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
    const cmd = text.toLowerCase().trim();
    if (cmd === '.menu' || cmd === '.help') return reply(`*ALEX BOT MENU*\n1. .menu\n2. .hi\n3. .ping\n4. .time\n5. .date\n6. .joke\n7. .quote\n8. .fact\n9. .motivate\n10. .meme\n11. .sticker\n12. .calc 2+2\n13. .flip\n14. .dice\n15. .rps rock\n16. .love Alex\n17. .8ball yes?\n18. .weather Lagos\n19. .owner\n20. .rules\n21. .alive\n22. .bye`);
    if (cmd === '.hi') return reply('Wagwan! Na Alex Bot be this 😎');
    if (cmd === '.ping') return reply('Pong! I dey online fast fast ⚡');
    if (cmd === '.time') return reply('Time now: ' + new Date().toLocaleTimeString());
    if (cmd === '.date') return reply('Date today: ' + new Date().toDateString());
    if (cmd === '.joke') return reply('Why chicken cross road? To go charge phone for your side 😂');
    if (cmd === '.quote') return reply('"No gree for anybody, but gree for Alex Bot" - Alex');
    if (cmd === '.fact') return reply('Fact: Your phone battery go soon die if you no charge am 😂');
    if (cmd === '.motivate') return reply('You go make am! No give up, keep pushing 💪');
    if (cmd === '.meme') return reply('Meme of the day: When you send .menu 10 times 😂');
    if (cmd === '.sticker') return reply('Send photo with caption .sticker (coming soon)');
    if (cmd.startsWith('.calc')) { try { let e = cmd.replace('.calc','').trim(); return reply('Answer: ' + eval(e)); } catch { return reply('Use like: .calc 2+2'); } }
    if (cmd === '.flip') return reply('Coin: ' + (Math.random() > 0.5 ? 'Heads' : 'Tails'));
    if (cmd === '.dice') return reply('Dice: ' + (Math.floor(Math.random()*6)+1));
    if (cmd.startsWith('.rps')) return reply('You play: ' + cmd.split(' ')[1] + ' | Alex play: rock');
    if (cmd.startsWith('.love')) return reply('Love for ' + cmd.replace('.love','') + ' na 98% ❤️');
    if (cmd.startsWith('.8ball')) return reply('8Ball says: Yes, na sure thing 🔮');
    if (cmd.startsWith('.weather')) return reply('Weather for ' + cmd.replace('.weather','') + ': Sunny, 32°C ☀️');
    if (cmd === '.owner') return reply('My owner na Alex - the baddest 🔥');
    if (cmd === '.rules') return reply('Rules: 1. No spam 2. Respect Alex Bot 3. No vex');
    if (cmd === '.alive') return reply('I dey alive! Alex Bot dey run 24/7 ✅');
    if (cmd === '.bye') return reply('Bye bye! Come back quick o 👋');
  });
}
startBot();
