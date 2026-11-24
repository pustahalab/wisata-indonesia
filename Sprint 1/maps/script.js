/*
 * NusantaraGo Maps - Squad 4 Sprint 1
 *  1. Memuat Google Maps JavaScript SDK memakai API key dari config.js (bukan di source).
 *  2. Menampilkan peta + marker penginapan/transportasi (data dari backend, jika tersedia).
 *  3. Menghitung jarak awal origin -> destination melalui Distance Matrix API
 *     (google.maps.DistanceMatrixService). Tidak ada angka statis / mock.
 *
 * Tahap pengujian dibedakan dan diekspos di window.__s4State:
 *   sdkLoaded -> requestSent -> responseReceived -> distanceRead
 */

var SDK_TIMEOUT_MS = 15000;      // batas tunggu pemuatan SDK
var DM_TIMEOUT_MS = 15000;       // batas tunggu respons Distance Matrix
var KEY_PLACEHOLDER = "ISI_API_KEY_ANDA_DI_SINI";

window.__s4State = {
    sdkLoaded: false, authFailure: false,
    requestSent: false, responseReceived: false, distanceRead: false,
    lastStatus: null, lastError: null, result: null
};
var S = window.__s4State;

function $(id) { return document.getElementById(id); }

function setStep(id, state) { $(id).dataset.state = state; }

function showError(msg) {
    S.lastError = msg;
    $("status").textContent = msg;
}

/* ---------------------------------------------------------------
 * 1. Pemuatan SDK
 * ------------------------------------------------------------- */
function getApiKey() {
    var cfg = window.APP_CONFIG;
    var key = cfg && cfg.GOOGLE_MAPS_API_KEY;
    if (!key || key === KEY_PLACEHOLDER) {
        throw new Error("API key belum dikonfigurasi. Salin config.example.js menjadi config.js lalu isi GOOGLE_MAPS_API_KEY.");
    }
    return key;
}

function loadGoogleMaps(apiKey) {
    return new Promise(function (resolve, reject) {
        var done = false;
        function finish(fn, arg) { if (!done) { done = true; clearTimeout(timer); fn(arg); } }

        // Dipanggil Google bila key ditolak (key salah / referrer tidak diizinkan / billing mati)
        window.gm_authFailure = function () {
            S.authFailure = true;
            setStep("step-sdk", "fail");
            showError("Autentikasi Google Maps gagal (API key tidak valid / dibatasi / billing belum aktif).");
            $("dm-submit").disabled = true;
        };

        window.__gmapsReady = function () { finish(resolve); };

        var timer = setTimeout(function () {
            finish(reject, new Error("Google Maps SDK tidak termuat dalam " + (SDK_TIMEOUT_MS / 1000) + " detik."));
        }, SDK_TIMEOUT_MS);

        var s = document.createElement("script");
        s.async = true;
        s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(apiKey) +
                "&callback=__gmapsReady&loading=async";
        s.onerror = function () {
            finish(reject, new Error("Google Maps SDK gagal dimuat (jaringan terblokir / API tidak dapat diakses)."));
        };
        document.head.appendChild(s);
    });
}

/* ---------------------------------------------------------------
 * 2. Peta + marker (data backend bersifat opsional; kegagalan tidak
 *    boleh mematikan fitur Distance Matrix)
 * ------------------------------------------------------------- */
function hasCoord(item) {
    return item.latitude !== null && item.latitude !== undefined &&
           item.longitude !== null && item.longitude !== undefined &&
           isFinite(Number(item.latitude)) && isFinite(Number(item.longitude));
}

function addMarkers(map, infoWindow, items, titleKey, label, detailKey) {
    items.filter(hasCoord).forEach(function (item) {
        var marker = new google.maps.Marker({
            position: { lat: Number(item.latitude), lng: Number(item.longitude) },
            map: map,
            title: item[titleKey]
        });
        marker.addListener("click", function () {
            var content = document.createElement("div");
            var title = document.createElement("h3");
            title.textContent = item[titleKey];
            var detail = document.createElement("p");
            detail.textContent = label + ": " + item[detailKey];
            var address = document.createElement("p");
            address.textContent = "Alamat: " + item.address;
            content.append(title, detail, address);
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        });
    });
}

async function loadMarkers(map) {
    var infoWindow = new google.maps.InfoWindow();
    try {
        var res = await Promise.all([fetch("/api/accommodations"), fetch("/api/transport-services")]);
        if (!res[0].ok || !res[1].ok) throw new Error("HTTP " + res[0].status + "/" + res[1].status);
        var accommodations = await res[0].json();
        var transports = await res[1].json();
        addMarkers(map, infoWindow, accommodations, "name", "Jenis", "accommodation_type");
        addMarkers(map, infoWindow, transports, "service_name", "Kendaraan", "vehicle_type");
    } catch (e) {
        // Backend belum tersedia: peta & Distance Matrix tetap berfungsi.
        console.warn("Data marker tidak dimuat:", e.message);
        $("status").dataset.note = "marker";
    }
}

/* ---------------------------------------------------------------
 * 3. Distance Matrix
 * ------------------------------------------------------------- */
function requestDistance(origin, destination) {
    return new Promise(function (resolve) {
        var settled = false;
        var timer = setTimeout(function () {
            if (!settled) { settled = true; resolve({ response: null, status: "TIMEOUT" }); }
        }, DM_TIMEOUT_MS);

        function done(response, status) {
            if (settled) return;
            settled = true; clearTimeout(timer);
            resolve({ response: response, status: status });
        }

        try {
            new google.maps.DistanceMatrixService().getDistanceMatrix({
                origins: [origin],
                destinations: [destination],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC
            }, done);
            S.requestSent = true;
            setStep("step-sent", "ok");
        } catch (e) {
            done(null, (e && e.code) || "EXCEPTION");
        }
    });
}

function resetSteps() {
    S.requestSent = S.responseReceived = S.distanceRead = false;
    S.lastStatus = S.lastError = S.result = null;
    ["step-sent", "step-response", "step-distance"].forEach(function (id) { setStep(id, "pending"); });
    $("dm-result").textContent = "";
    $("status").textContent = "";
}

async function onSubmit(ev) {
    ev.preventDefault();
    resetSteps();

    var origin = DistanceLogic.parseLocation($("dm-origin").value);
    var destination = DistanceLogic.parseLocation($("dm-destination").value);
    if (origin === null || destination === null) {
        showError("Origin dan destination wajib diisi (format: lat,lng atau alamat; lat -90..90, lng -180..180).");
        return;
    }

    $("dm-submit").disabled = true;
    var r = await requestDistance(origin, destination);
    $("dm-submit").disabled = S.authFailure;
    S.lastStatus = r.status;

    if (r.status === "TIMEOUT") {
        setStep("step-sent", S.requestSent ? "ok" : "fail");
        setStep("step-response", "fail");
        showError("Distance Matrix API tidak merespons (timeout). Periksa koneksi/akses ke Google.");
        return;
    }
    if (r.response !== null || r.status) { S.responseReceived = true; }

    var out = DistanceLogic.interpret(r.response, r.status);
    S.result = out;

    // Tahap 3: respons diterima (walau berisi error, API tetap merespons)
    setStep("step-response", r.status ? (r.status === "OK" ? "ok" : "fail") : "fail");

    if (!out.ok) {
        setStep("step-distance", "fail");
        showError("Gagal menghitung jarak [" + out.code + "]: " + out.message);
        return;
    }

    S.distanceRead = true;
    setStep("step-distance", "ok");
    var txt = "Jarak: " + out.distance.text + " (" + out.distance.meters + " m)";
    if (out.duration) txt += " | Durasi: " + out.duration.text + " (" + out.duration.seconds + " dtk)";
    else txt += " | Durasi: tidak tersedia";
    $("dm-result").textContent = txt;
}

/* ---------------------------------------------------------------
 * Inisialisasi
 * ------------------------------------------------------------- */
async function main() {
    $("dm-form").addEventListener("submit", onSubmit);

    var key;
    try { key = getApiKey(); }
    catch (e) { setStep("step-sdk", "fail"); showError(e.message); return; }

    try { await loadGoogleMaps(key); }
    catch (e) { setStep("step-sdk", "fail"); showError(e.message); return; }

    S.sdkLoaded = true;
    if (!S.authFailure) setStep("step-sdk", "ok");

    var map = new google.maps.Map($("map"), { center: { lat: -2.5489, lng: 118.0149 }, zoom: 5 });
    $("dm-submit").disabled = S.authFailure;
    loadMarkers(map);
}

document.addEventListener("DOMContentLoaded", main);
