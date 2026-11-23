/**
 * File: src/controllers/ticket.controller.js
 * Deskripsi: Menangani request HTTP untuk pembuatan e-tiket dan validasi scan gerbang
 */

const { generateTicketQRCode } = require("../utils/qr.util");
const { verifyHMACSignature } = require("../utils/hmac.util");
const ticketsDb = require("../data/tickets.mock");

// 1. Endpoint Penerbitan E-Tiket
async function generateTicket(req, res) {
  //validasi input
  const { ticketId } = req.body;
  if (!ticketId) {
    return res.status(400).json({ error: "ticketId diperlukan" });
  }
  // 1. Cari tiket di database (ticketsDb)
  const ticket = ticketsDb.find((t) => t.ticketId === ticketId);
  if (!ticket) {
    return res.status(404).json({ error: "Tiket tidak ditemukan" });
  }
  try {
    // 2. Panggil generateTicketQRCode() dari qr.util.js
    const qrResult = await generateTicketQRCode({
      ticketId: ticket.ticketId,
      bookingId: ticket.bookingId,
      destinationId: ticket.destinationId,
      visitDate: ticket.visitDate,
    });

    // 3. Kirim hasil QR Code ke user
    return res.json({
      success: true,
      message: "QR Code berhasil dibuat",
      data: {
        ticket,
        qrToken: qrResult.qrToken,
        qrImage: qrResult.qrImage,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Endpoint Validasi Scanner Gerbang Masuk
async function validateGateScan(req, res) {
  // TODO (George):

  // pastikan data dari alat pemindai lengkap
  if (!qrToken || !gateDestinationId) {
    return res.status(400).json({
      success: false,
      message: "qrToken dan gateDestinationId wajib disertakan scanner",
    });
  }
  // 1. Decode qrToken dari Base64 ke JSON
  let decoded;
  try {
    const jsonStr = Buffer.from(qrToken, "base64").toString("utf8");
    decoded = JSON.parse(jsonStr);
  } catch {
    return res.status(400).json({
      success: false,
      validationStatus: "INVALID_QR_FORMAT",
      message: "Format QR Code rusak atau tidak valid",
    });
  }
  // 2. Panggil verifyHMACSignature(payload, signature) untuk cek keaslian
  // 3. Cek apakah tiket ditemukan di ticketsDb
  // 4. Cek apakah tiket statusnya sudah 'USED' (cegah scan berulang)
  // 5. Bila semua valid: status diubah menjadi 'USED', waktu scan dicatat, dan kembalikan akses 'ACCESS_GRANTED'
  return res.json({
    message: "TODO: Implementasi validateGateScan oleh George",
  });
}

module.exports = {
  generateTicket,
  validateGateScan,
};
