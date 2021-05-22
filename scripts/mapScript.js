let map, heatMap, cluster;
let pointInfo;
let points;
let markers = [];
let infoWindows = [];

function loadFunc(token, env) {
    // Create the script tag, set the appropriate attributes
    var script = document.createElement('script');
    script.src="https://maps.googleapis.com/maps/api/js?key=" + token + "&libraries=visualization&callback=initMap";
    script.async = true;
    // Append the 'script' element to 'head'
    document.head.appendChild(script);

    // Attach your callback function to the `window` object
    window.initMap = function() {
        var req = new XMLHttpRequest();
        req.open('GET', '/map/getReports', true);
        req.setRequestHeader('Content-Type', 'plain/text;charset=UTF-8');
        req.send();

        req.onreadystatechange = function() {
            if (req.readyState == 4 && req.status == 200) { 
                var response = JSON.parse(req.responseText);
                points = response;

                map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: -34.397, lng: 150.644 },
                    zoom: 8,
                    mapTypeControl: true,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                        position: google.maps.ControlPosition.TOP_RIGHT
                    }
                });

                heatMap = new google.maps.visualization.HeatmapLayer({
                    data: getHeatMapData(),
                    map: null
                });

                addPanToCurrentLocationButton();
                loadMarkers();

                cluster = new MarkerClusterer(map, markers, {
                    imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
                });
            }
        }
    };
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
                /*infoWindow.setPosition(pos);
                infoWindow.setContent("Location found.");
                infoWindow.open(map);*/
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
    for(i = 0; i < points.length; i++) {
        const latLng = new google.maps.LatLng(points[i].lat, points[i].long);

        const markerUrl = chooseMarkerColor(points[i].type);
        const marker = new google.maps.Marker({
            position: latLng,
            title: points[i].type,
            icon: {
                url: markerUrl
            }
        });

        const infoWindow = new google.maps.InfoWindow({
            content: getMarkerTitle(points[i].type, points[i].length)
        });

        marker.set("id", points[i].id);

        marker.addListener('click', () => {
            clearCurrentSideBar();
            sideBarVisible(true);
            map.setZoom(20);
            map.setCenter(marker.getPosition());
            closeAllInfoWindows();
            infoWindow.open(marker.get('map'), marker);
            loadSideBarInfo(marker.get("id"));
        });
        marker.setMap(map);
        markers.push(marker);
        infoWindows.push(infoWindow);
    }
}

function closeAllInfoWindows() {
    for(let i = 0; i < infoWindows.length; i++) {
        infoWindows[i].close();
    }
}

function getMarkerTitle(type, length) {
    var typePtBr;
    switch (type) {
        case 'Depredation': typePtBr = 'Depredação';     break;
        case 'Road':        typePtBr = 'Problema na via';  break;
        case 'Leak':        typePtBr = 'Vazamento';   break;
        case 'Garbage':     typePtBr = 'Depósito de lixo'; break;
        case 'Flood':       typePtBr = 'Alagamento'; break;
    }
    var html =  '<div id="content">' +
                    '<div id="siteNotive">' +
                '</div>' +
                '<p><center><h3> ' + typePtBr + '</h3></center></p>' +
                '<p><center> Quantidade: ' + length + '</center></p>';
    return html;
}

function chooseMarkerColor(type) {
    var dot;
    switch (type) {
        case 'Depredation': dot = 'blue';     break;
        case 'Road':        dot = 'green';  break;
        case 'Leak':        dot = 'pink';   break;
        case 'Garbage':     dot = 'yellow'; break;
        case 'Flood':       dot = 'purple'; break;
    }
    return ('http://maps.google.com/mapfiles/ms/icons/' + dot + '-dot.png');
}

function sideBarVisible(visible) {
    const sideBar = document.getElementById("sideBar");
    if(visible) {
        sideBar.style.visibility = "visible";
    } else {
        map.setZoom(15);
        sideBar.style.visibility = "hidden";
        closeAllInfoWindows();
    }
}

function clearCurrentSideBar() {
    const sideBar = document.getElementById("images");
    while(sideBar.firstChild) {
        sideBar.removeChild(sideBar.firstChild);
    }
}

function loadSideBarInfo(id) {
    var req = new XMLHttpRequest();
    req.open('POST', '/map/getPoint/'+id, true);
    req.setRequestHeader('Content-Type', 'plain/text;charset=UTF-8');

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            const response = JSON.parse(req.responseText);
            pointInfo = response;
            for(var i = 0; i < response.length; i++) {
                appendChild(response[i].reportId, response[i].image);
            }
        }
    }
    req.send();
}

function appendChild(id, image) {
    // Create div that will fit the image
    var divContainer = document.createElement("div");
    divContainer.id = "div" + id;
    divContainer.position = "relative";
    divContainer.style.textAlign = "center";

    // Create the image
    var elem = document.createElement("img");
    elem.id = id;
    elem.src = "data:image/jpg;base64, " + image;
    elem.style.width = "300px";
    elem.style.height = "200px";
    elem.onmouseover = function() { mouseOver(id); };
    elem.onmouseout = function() { mouseOut(id); }

    // Add Image to div and append to sidebar
    divContainer.appendChild(elem);
    document.getElementById("images").appendChild(divContainer);
}

function mouseOver(id) {
    var description = "";
    for(var i = 0; i < pointInfo.length; i++) {
        if(pointInfo[i].reportId == id) {
            description = pointInfo[i].description;
            break;
        }
    }
    if(description == "") {
        description = "Essa foto não possui descrição!";
    }

    var d = document.createElement("div");
    d.id = "text"+id;
    d.style.position = "relative";
    d.style.marginTop = "20px";
    d.style.left="50%";
    d.style.fontSize = "20px";
    d.style.color = "white";
    d.style.transform = "translate(-50%, -50%)";
    d.innerHTML = description;

    // Set image opacity
    document.getElementById(id).style.opacity = 0.25;
    document.getElementById("div"+id).appendChild(d);
}

function mouseOut(id) {
    var elem = document.getElementById(id);
    elem.style.opacity = 1;

    var div = document.getElementById("text"+id);
    if(div.parentNode)
        div.parentNode.removeChild(div);
}

function toggleHeatMap() {
    if(heatMap.getMap()) {
        heatMap.setMap(null);
        cluster.setMap(map);
        setMapOnAll(map);
        showHeatMapOptions(false);
    } else {
        heatMap.setMap(map);
        cluster.setMap(null);
        setMapOnAll(null);
        showHeatMapOptions(true);
    }
}

function showHeatMapOptions(value) {
    var d = document.getElementById("heatMapDiv");

    if(value) {
        var radius = document.createElement("a");
        radius.id = "heatMapRadius";
        radius.innerHTML = "Alterar o raio";
        radius.style.padding = '8px 8px 8px 50px';
        radius.style.fontSize = '20px';
        radius.onclick = changeRadius;

        var opacity = document.createElement("a");
        opacity.id = "heatMapOpacity";
        opacity.innerHTML = "Alterar opcidade";
        opacity.style.padding = '8px 8px 8px 50px';
        opacity.style.fontSize = '20px';
        opacity.onclick = changeOpacity;

        d.appendChild(radius);
        d.appendChild(opacity);
    } else {
        d.removeChild(document.getElementById("heatMapRadius"));
        d.removeChild(document.getElementById("heatMapOpacity"));
    }
}

function changeRadius() {
    heatMap.set("radius", heatMap.get("radius") ? null : 20);
}

function changeOpacity() {
    heatMap.set("opacity", heatMap.get("opacity") ? null : 0.2);
}

function setMapOnAll(map) {
    for(let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function getHeatMapData() {
    var heatMapData = [];
    if(points.length > 0) {
        for(var i = 0; i < points.length; i++) {
            heatMapData.push({
                location: new google.maps.LatLng(points[i].lat, points[i].long),
                weight: points[i].length
            });
        }
    }
    return heatMapData;
}

function toggleCluster() {
    cluster.setMap(cluster.getMap() ? null : map);
}