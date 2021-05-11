function loadMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYmdtYXJpbmkiLCJhIjoiY2tvanpidnZyMDR5YzJwbzhsaG94YWRzdiJ9.kpBGNbJAsIPNv5jjJX2mPQ';//'pk.eyJ1IjoiYmdtYXJpbmkiLCJhIjoiY2tvanpidnZyMDR5YzJwbzhsaG94YWRzdiJ9.kpBGNbJAsIPNv5jjJX2mPQ';
            
    if('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
        });
    } else {
        console.log("Not able to get current position");
    }

    var map = new mapboxgl.Map({
                container: 'map', // container ID
                style: 'mapbox://styles/mapbox/streets-v11', // style URL
                center: [0,0], // starting position [lng, lat]
                zoom: 0 // starting zoom
    });
    // Add geolocate control to the map.
    map.addControl(
        new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        })
    );

    var req = new XMLHttpRequest();
    req.open('GET', '/map/getReports', true);
    req.setRequestHeader('Content-Type', 'plain/text;charset=UTF-8');
    req.send();

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) { 
            var response = req.responseText;
            
            var geojson = JSON.parse(response);
            // add markers to map
            geojson.features.forEach(function(marker) {

            // create a HTML element for each feature
            var el = document.createElement('div');
            el.className = 'marker';
        
            // make a marker for each feature and add to the map
            new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .addTo(map);
            });
        }
    }
}