/**
 * File: src/utils/qr.util.js
 * Deskripsi: Helper untuk membuat gambar QR Code dari token tiket
 */

const QRCode = require("qrcode");
const { generateHMACSignature } = require("./hmac.util");

async function generateTicketQRCode(ticketInfo) {
  // TODO (George):
  // 1. Ambil informasi penting dari ticketInfo (ticketId, bookingId, destinationId, visitDate)
  const payload = {
    ticketId: ticketInfo.ticketId,
    bookingId: ticketInfo.bookingId,
    destinationId: ticketInfo.destinationId,
    visitDate: ticketInfo.visitDate,
  };

  // 2. Gunakan generateHMACSignature() dari hmac.util.js untuk membuat signature
  const signature = generateHMACSignature(payload);

  // 3. Gabungkan payload + signature
  const qrRawData = {
    ...payload,
    signature: signature,
  };

  // Encode data menjadi string JSON dan kemudian ke Base64
  const qrTokenString = Buffer.from(JSON.stringify(qrRawData)).toString(
    "base64",
  );

  // 5. Gambar visual QR Code dalam url (qrImage)
  const qrImageDataUrl = await QRCode.toDataURL(qrTokenString, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 6,
  });

  return {
    qrToken: qrTokenString,
    qrImage: qrImageDataUrl,
  };
}

module.exports = {
  generateTicketQRCode,
};
