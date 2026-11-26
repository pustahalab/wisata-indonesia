/**
 * File: src/data/tickets.mock.js
 * Deskripsi: Data tiruan (mock) tiket untuk pengujian lokal Sprint 3
 */

const ticketsMock = [
  //Uji Skenario: Tiket Normal
  {
    ticketId: "TKT-001",
    bookingId: "BKG-20261122-001",
    destinationId: "DEST-Kelimutu",
    destinationName: "Danau Kelimutu",
    visitorName: "Georg Da Lopez",
    pax: 2,
    visitDate: "2026-12-01", // Tanggal kunjungan aktif di masa depan
    status: "ACTIVE", // 'ACTIVE' (belum dipakai)
    scannedAt: null,
    scannedByGate: null,
  },

  //Uji Skenario: Tiket Destinasi Berbeda
  {
    ticketId: "TKT-002",
    bookingId: "BKG-20261122-002",
    destinationId: "DEST-BROMO",
    destinationName: "Puncak Bromo",
    visitorName: "Ralafe Leano",
    pax: 2,
    visitDate: "2026-12-01", // Tanggal kunjungan yang valid
    status: "ACTIVE", // 'ACTIVE' (belum dipakai) atau 'USED' (sudah discan)
    scannedAt: null,
    scannedByGate: null,
  },

  //Uji Skenario: Tiket Sudah Pernah Dipakai
  {
    ticketId: "TKT-003",
    bookingId: "BKG-20261124-003",
    destinationId: "DEST-Toba",
    destinationName: "Danau Toba",
    visitorName: "Zekhiel Math",
    pax: 3,
    visitDate: "2026-12-01", // Tanggal kunjungan yang valid
    status: "USED", // 'USED' - sudah digunakan
    scannedAt: "2026-11-24",
    scannedByGate: "Gate-Timur-02",
  },

  //Uji Skenario: Tiket Sudah Hangus
  {
    ticketId: "TKT-004",
    bookingId: "BKG-20261120-004",
    destinationId: "DEST-Safari",
    destinationName: "Taman Safari",
    visitorName: "Mico005",
    pax: 2,
    visitDate: "2026-11-10", // Tanggal kunjungan yang sudah lewat
    status: "Aktif",
    scannedAt: null,
    scannedByGate: null,
  },
];
module.exports = ticketsMock;
