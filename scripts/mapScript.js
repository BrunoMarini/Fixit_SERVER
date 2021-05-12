let map;

function loadFunc() {
    // Create the script tag, set the appropriate attributes
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB-k_KvuaBxPxRoGx-Gkkaw7e4bdCWyRjs&callback=initMap';
    script.async = true;

    // Attach your callback function to the `window` object
    window.initMap = function() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8
        });

        addPanToCurrentLocationButton();
        loadMarkers();
    };

    // Append the 'script' element to 'head'
    document.head.appendChild(script);
}

// Add button "Go to current locaiton"
function addPanToCurrentLocationButton() {
    infoWindow = new google.maps.InfoWindow();
    const locationButton = document.createElement("button");
    locationButton.textContent = "Ir a posição atual";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                infoWindow.setPosition(pos);
                infoWindow.setContent("Location found.");
                infoWindow.open(map);
                map.setCenter(pos);
            }, () => {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}

function loadMarkers() {
    var req = new XMLHttpRequest();
    req.open('GET', '/map/getReports', true);
    req.setRequestHeader('Content-Type', 'plain/text;charset=UTF-8');
    req.send();

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) { 
            var response = JSON.parse(req.responseText);
            for(i = 0; i < response.length; i++) {
                const latLng = new google.maps.LatLng(response[i][1], response[i][2]);
                const mapOpt = {
                    center: latLng
                }
                const marker = new google.maps.Marker({
                    position: latLng,
                    title: response[i][0],
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: response[i][0]
                });

                marker.addListener('click', () => {
                    map.setZoom(8);
                    map.setCenter(marker.getPosition());
                    infoWindow.open(marker.get('map'), marker);
                });

                marker.setMap(map);
            }
        }
    }
}