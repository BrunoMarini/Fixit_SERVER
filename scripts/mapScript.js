let map;
let pointInfo;

function loadFunc(token, env) {
    // Create the script tag, set the appropriate attributes
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + token + '&callback=initMap';
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

                const marker = new google.maps.Marker({
                    position: latLng,
                    title: response[i][0],
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: response[i][0]
                });

                marker.set("id", response[i][3]);

                marker.addListener('click', () => {
                    clearCurrentSideBar();
                    sideBarVisible(true);
                    map.setZoom(13);
                    map.setCenter(marker.getPosition());
                    infoWindow.open(marker.get('map'), marker);
                    loadSideBarInfo(marker.get("id"));
                });
                marker.setMap(map);
            }
        }
    }
}

function sideBarVisible(visible) {
    const sideBar = document.getElementById("sideBar");
    sideBar.style.visibility = (visible ? "visible" : "hidden");
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