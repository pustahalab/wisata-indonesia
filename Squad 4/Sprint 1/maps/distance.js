/*
 * Logika murni (tanpa DOM / tanpa Google SDK) untuk Distance Matrix.
 * Dipakai oleh script.js di browser dan diuji unit di Node
 * (tests/maps/distance_unit_test.js).
 */
(function (root, factory) {
    if (typeof module === "object" && module.exports) module.exports = factory();
    else root.DistanceLogic = factory();
}(typeof self !== "undefined" ? self : this, function () {

    // Status tingkat-respons (response.status) & tingkat-elemen (element.status)
    // sesuai dokumentasi Distance Matrix.
    var MESSAGES = {
        INVALID_REQUEST: "Permintaan tidak valid (origin/destination kosong atau salah format).",
        OVER_QUERY_LIMIT: "Kuota/batas permintaan API terlampaui.",
        REQUEST_DENIED: "Permintaan ditolak. Periksa API key, pengaktifan Distance Matrix API, billing, dan pembatasan key.",
        UNKNOWN_ERROR: "Kesalahan server Google. Coba lagi.",
        MAX_ELEMENTS_EXCEEDED: "Jumlah origin x destination melebihi batas.",
        MAX_DIMENSIONS_EXCEEDED: "Jumlah origin/destination melebihi batas.",
        NOT_FOUND: "Origin atau destination tidak dapat ditemukan/di-geocode.",
        ZERO_RESULTS: "Tidak ada rute darat antara origin dan destination.",
        MAX_ROUTE_LENGTH_EXCEEDED: "Rute terlalu panjang untuk dihitung."
    };

    function messageFor(code) {
        return MESSAGES[code] || ("Status tidak dikenal: " + code);
    }

    /** "lat,lng" -> {lat,lng}; selain itu dianggap alamat/nama tempat (string). */
    function parseLocation(text) {
        var s = String(text == null ? "" : text).trim();
        if (!s) return null;
        var m = /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/.exec(s);
        if (m) {
            var lat = parseFloat(m[1]), lng = parseFloat(m[2]);
            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
            return { lat: lat, lng: lng };
        }
        return s;
    }

    /**
     * Menafsirkan (response, status) dari DistanceMatrixService.getDistanceMatrix.
     * Mengembalikan objek dengan field `stage` yang membedakan tahap:
     *   "no_response"       -> tidak ada respons dari API
     *   "response_error"    -> API merespons, tetapi status tingkat-respons != OK
     *   "element_error"     -> status respons OK, tetapi elemen origin-destination gagal
     *   "distance_read"     -> jarak berhasil dibaca dari respons
     */
    function interpret(response, status) {
        if (status !== "OK") {
            return { ok: false, stage: response ? "response_error" : "no_response",
                     code: status || "NO_STATUS", message: messageFor(status) };
        }
        var row = response && response.rows && response.rows[0];
        var el = row && row.elements && row.elements[0];
        if (!el) {
            return { ok: false, stage: "response_error", code: "EMPTY_RESPONSE",
                     message: "Respons OK tetapi tidak berisi elemen hasil." };
        }
        if (el.status !== "OK") {
            return { ok: false, stage: "element_error", code: el.status, message: messageFor(el.status),
                     originAddress: (response.originAddresses || [])[0],
                     destinationAddress: (response.destinationAddresses || [])[0] };
        }
        var d = el.distance, t = el.duration;
        if (!d || typeof d.value !== "number") {
            return { ok: false, stage: "response_error", code: "NO_DISTANCE",
                     message: "Elemen OK tetapi nilai jarak tidak ada." };
        }
        return {
            ok: true, stage: "distance_read", code: "OK",
            distance: { text: d.text, meters: d.value },
            duration: t && typeof t.value === "number" ? { text: t.text, seconds: t.value } : null,
            originAddress: (response.originAddresses || [])[0],
            destinationAddress: (response.destinationAddresses || [])[0]
        };
    }

    return { parseLocation: parseLocation, interpret: interpret, messageFor: messageFor, MESSAGES: MESSAGES };
}));
