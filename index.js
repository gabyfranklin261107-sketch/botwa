const http = require('http');
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

// --- 1. WEB SERVER UNTUK RENDER ---
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot WhatsApp is running!\n');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Web server berjalan di port ${PORT}`);
});

// --- 2. BOT WHATSAPP ---
async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const sock = makeWASocket({ 
        auth: state, 
        logger: pino({ level: 'silent' }), 
        printQRInTerminal: false 
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) {
            console.log('--- SCAN QR CODE INI ---');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') {
            console.log('✅ BOT BERHASIL TERHUBUNG KE WHATSAPP!');
        }
        if (connection === 'close') {
            console.log('❌ Koneksi terputus, mencoba menghubungkan ulang...');
            start();
        }
    });
}
start();