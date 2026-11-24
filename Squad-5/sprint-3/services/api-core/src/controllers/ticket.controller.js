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
  const { qrToken, gateDestinationId, gateScannerId } = req.body;
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

  const { signature, ...payload } = decoded;

  // 2. Panggil verifyHMACSignature(payload, signature) untuk cek keaslian
  const isValidSignature = verifyHMACSignature(payload, signature);
  if (!isValidSignature) {
    return res.status(403).json({
      success: false,
      validationStatus: "TAMPERED_QR",
      message: "Akses ditolak. QR telah dimodifikasi",
    });
  }

  // 3. Cek apakah tiket ditemukan di ticketsDb
  const ticket = ticketsDb.find((t) => t.ticketId === payload.ticketId);
  if (!ticket) {
    return res.status(404).json({
      success: false,
      validationStatus: "Not_Found",
      message: "Tiket tidak terdaftar",
    });
  }
  // 4. Cek apakah tiket statusnya sudah 'USED' (cegah scan berulang)
  if (ticket.status === "USED") {
    return res.status(409).json({
      success: false,
      validationStatus: "Already_Used",
      message: `Tiket sudah pernah digunakan pada ${ticket.scannedAt} di gerbang ${ticket.scannedByGate}!`,
      scannedAt: ticket.scannedAt,
    });
  }

  //Cek kadaluwarsa
  const today = new Date().toISOString().slice(0, 10);
  if (ticket.visitDate < today) {
    ticket.status = "EXPIRED";
    return res.status(410).json({
      success: false,
      validationStatus: "EXPIRED",
      message: `Tiket sudah hangus (Berlaku pada ${ticket.visitdate})`,
    });
  }

  // 5. Bila semua valid: status diubah menjadi 'USED', waktu scan dicatat, dan kembalikan akses 'ACCESS_GRANTED'
  ticket.status = "USED";
  ticket.scannedAt = new Date().toISOString();
  ticket.scannedByGate = gateScannerId || "GATE-UTAMA-01";

  return res.json({
    success: true,
    validationStatus: "ACCESS_GRANTED",
    message: "Validasi Berhasil! Silakan Masuk.",
    visitor: {
      name: ticket.visitorName,
      pax: ticket.pax,
      destination: ticket.destinationName,
    },
    checkInTime: ticket.scannedAt,
  });
}

module.exports = {
  generateTicket,
  validateGateScan,
};
