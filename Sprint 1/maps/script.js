async function initMap() {

    // Menampilkan peta Indonesia
    const map = new google.maps.Map(
        document.getElementById("map"),
        {
            center: {
                lat: -2.5489,
                lng: 118.0149
            },
            zoom: 5
        }
    );

    const infoWindow = new google.maps.InfoWindow();

    try {

        // Mengambil data penginapan dan transportasi dari backend
        const [accommodationResponse, transportResponse] =
            await Promise.all([
                fetch("/api/accommodations"),
                fetch("/api/transport-services")
            ]);

        if (!accommodationResponse.ok || !transportResponse.ok) {
            throw new Error("Gagal mengambil data");
        }

        const accommodations = await accommodationResponse.json();
        const transports = await transportResponse.json();

        // Menampilkan marker penginapan
        accommodations.forEach(item => {

            const marker = new google.maps.Marker({
                position: {
                    lat: Number(item.latitude),
                    lng: Number(item.longitude)
                },
                map: map,
                title: item.name
            });

            marker.addListener("click", () => {

                const content = document.createElement("div");

                const title = document.createElement("h3");
                title.textContent = item.name;

                const type = document.createElement("p");
                type.textContent = "Jenis: " + item.accommodation_type;

                const address = document.createElement("p");
                address.textContent = "Alamat: " + item.address;

                content.append(title, type, address);

                infoWindow.setContent(content);
                infoWindow.open(map, marker);
            });

        });

        // Menampilkan marker transportasi
        transports.forEach(item => {

            const marker = new google.maps.Marker({
                position: {
                    lat: Number(item.latitude),
                    lng: Number(item.longitude)
                },
                map: map,
                title: item.service_name
            });

            marker.addListener("click", () => {

                const content = document.createElement("div");

                const title = document.createElement("h3");
                title.textContent = item.service_name;

                const vehicle = document.createElement("p");
                vehicle.textContent = "Kendaraan: " + item.vehicle_type;

                const address = document.createElement("p");
                address.textContent = "Alamat: " + item.address;

                content.append(title, vehicle, address);

                infoWindow.setContent(content);
                infoWindow.open(map, marker);
            });

        });

    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        alert("Gagal mengambil data lokasi.");
    }
}

window.initMap = initMap;
