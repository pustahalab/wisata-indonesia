/**
 * Adapter API Cuaca Publik BMKG (Node.js, tanpa dependensi tambahan)
 * Endpoint: https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode_adm4}
 * Sumber data wajib dicantumkan: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
 */

async function ambilCuacaBmkg(kodeAdm4 = "31.71.03.1001") {
  const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${encodeURIComponent(kodeAdm4)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    const cuacaTerdekat = json?.data?.[0]?.cuaca?.[0]?.[0];

    if (!cuacaTerdekat) {
      throw new Error("Data prakiraan cuaca kosong");
    }

    const waktuAnalisis = new Date(`${cuacaTerdekat.analysis_date}Z`);
    const usiaJam = Number(((Date.now() - waktuAnalisis.getTime()) / 3600000).toFixed(1));

    return {
      BMKG_TERSEDIA: true,
      BMKG_USIA_JAM: usiaJam,
      CURAH_HUJAN_MM: cuacaTerdekat.tp ?? 0,
      PERINGATAN_DINI: "TIDAK_ADA",
      sumber: "BMKG (api.bmkg.go.id)",
    };
  } catch (error) {
    return {
      BMKG_TERSEDIA: false,
      BMKG_USIA_JAM: null,
      CURAH_HUJAN_MM: null,
      PERINGATAN_DINI: null,
      error: error.message,
    };
  }
}

module.exports = { ambilCuacaBmkg };

// Pengujian langsung jika dijalankan dengan: node bmkgAdapter.js
if (require.main === module) {
  ambilCuacaBmkg().then((hasil) => console.log(hasil));
}
