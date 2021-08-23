let map, heatMap, cluster, geocoder;
let pointInfo;
let points, resolvedPoints;
let idToBeDeleted = undefined;
let markers = [];
let resolvedMarkers = [];
let infoWindows = [];
let adminToken = undefined;
let showResolved = false;
let isShowSelectedOnly = 0;
let defaultMapCenter = { lat: -15.79936757290689, lng: -47.861774584170796 };
let mapStyleClear =
[{
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [{ "visibility": "off" }]
}, {
    "featureType": "poi.business",
    "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "transit",
      "stylers": [{ "visibility": "off" }]
}];

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
                    // Defining Brasilia as map center if the browser does not support geolocation
                    center: defaultMapCenter,
                    zoom: 8,
                    mapTypeControl: true,
                    styles: mapStyleClear,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                        position: google.maps.ControlPosition.TOP_RIGHT
                    }
                });

                heatMap = new google.maps.visualization.HeatmapLayer({
                    data: getHeatMapData(),
                    map: null
                });

                geocoder = new google.maps.Geocoder();

                addPanToCurrentLocationButton();
                loadMarkers(false);

                cluster = new MarkerClusterer(map, markers, {
                    ignoreHidden: true,
                    imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
                });

                // If browser supports geolocation the map will start centered in user current position
                if(navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                      user_location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                      map.setCenter(user_location);
                    });
                } else {
                    console.log("Error! Browser does not support geolocation");
                }
            }
        }
    };
}

// Add button "Go to current locaiton"
function addPanToCurrentLocationButton() {
    infoWindow = new google.maps.InfoWindow();
    const locationButton = document.createElement("button");
    locationButton.textContent = "Ir a posição atual";

    //Style
    locationButton.id = "locationButton";

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

function loadMarkers(isResolved) {
    let values;
    if(isResolved) {
        values = resolvedPoints;
    } else {
        values = points;
    }
    for(i = 0; i < values.length; i++) {
        const latLng = new google.maps.LatLng(values[i].lat, values[i].long);
        const markerUrl = chooseMarkerColor(values[i].type);
        const marker = new google.maps.Marker({
            position: latLng,
            title: values[i].type,
            icon: {
                url: markerUrl
            }
        });

        const infoWindow = new google.maps.InfoWindow({
            content: getMarkerTitle(values[i].type, values[i].length)
        });

        marker.set("id", values[i].type + "@" + values[i].id);

        if(isResolved) {
            marker.addListener('click', () => {
                clearCurrentSideBar();
                map.setZoom(20);
                map.setCenter(marker.getPosition());
                closeAllInfoWindows();
                closeAddress();
                infoWindow.open(marker.get('map'), marker);
            });
        } else {
            marker.addListener('click', () => {
                clearCurrentSideBar();
                sideBarVisible(true);
                map.setZoom(20);
                map.setCenter(marker.getPosition());
                closeAllInfoWindows();
                closeAddress();
                infoWindow.open(marker.get('map'), marker);
                loadSideBarInfo(marker.get("id"));
                loadAddressInfo(marker);
            });
        }

        marker.setMap(map);
        if(isResolved) {
            resolvedMarkers.push(marker);
        } else {
            markers.push(marker);
        }
        infoWindows.push(infoWindow);
    }
}

function closeAllInfoWindows() {
    for(let i = 0; i < infoWindows.length; i++) {
        infoWindows[i].close();
    }
}

function getMarkerTitle(type, length) {
    var typePtBr = translateType(type);
    var html =  '<div id="content">' +
                    '<div id="siteNotive">' +
                '</div>' +
                '<p><center><h3> ' + typePtBr + '</h3></center></p>' +
                '<p><center> Quantidade: ' + length + '</center></p>';
    return html;
}

function translateType(type) {
    switch (type) {
        case 'Depredation': return 'Depredação';
        case 'Road':        return 'Problema na via';
        case 'Leak':        return 'Vazamento';
        case 'Garbage':     return 'Depósito de lixo';
        case 'Flood':       return 'Alagamento';
        case 'Multiple':    return 'Multiplos Tipos';
    }
}

function chooseMarkerColor(type) {
    var dot;
    switch (type) {
        case 'Depredation': dot = 'blue';   break;
        case 'Road':        dot = 'green';  break;
        case 'Leak':        dot = 'pink';   break;
        case 'Garbage':     dot = 'yellow'; break;
        case 'Flood':       dot = 'purple'; break;
        default: return  './img/marker/multipleIcon.png';
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
        closeAddress();
    }
}

function clearScreen() {
    const sideBar = document.getElementById("sideBar");
    sideBar.style.visibility = "hidden";
    closeAllInfoWindows();
    clearCurrentSideBar();
    closeAddress();
}

function clearCurrentSideBar() {
    const sideBar = document.getElementById("images");
    while(sideBar.firstChild) {
        sideBar.removeChild(sideBar.firstChild);
    }
}

async function loadSideBarInfo(id) {
    const type = id.split("@")[0];
    id = id.split("@")[1];

    //Add resolve location button if admin
    if(adminToken != undefined && adminToken.length > 0) {
        const btnResolve = document.createElement("button");

        // Style
        btnResolve.id = "btnResolve";
        btnResolve.innerHTML = "Marcar posição como resolvida";//Resolver Localização";
        btnResolve.onclick = function() { resolveLocation(id); };

        document.getElementById('address').appendChild(btnResolve);
    }

    let url = '/map/getPoint';
    let h = new Headers();
    h.append('Content-type', 'application/json');

    let json = { id: id, type: type };
    let req = new Request(url, {
        headers: h,
        body: JSON.stringify(json),
        method: 'POST'
    });

    const res = await fetch(req);

    if(res.ok) {
        const response = await res.json();
        pointInfo = response;
        for(var i = 0; i < response.length; i++) {
            appendChild(response[i].reportId, response[i].image);
        }
    }
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
    elem.style.width = 'auto';
    elem.style.height = 'auto';
    elem.style.maxWidth = '100%';
    /*elem.style.width = "300px";
    elem.style.height = "200px";*/
    elem.onmouseover = function() { mouseOver(id); };
    elem.onmouseout = function() { mouseOut(id); }

    elem.onclick = function() { openImageZoom(id); };
    elem.style.cursor = 'pointer';

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
    disableAllSelectedTypes();
    if(heatMap.getMap()) {
        heatMap.setMap(null);
        setMapOnAll(map);
        showHeatMapOptions(false);
        unblockButton("filterShowResolved");
        unblockButton("filterShowAll");
        unblockTypeButton();
        refreshMap();
    } else {
        heatMap.setMap(map);
        setMapOnAll(null);
        setMapOnAllResolved(null);
        showHeatMapOptions(true);
        blockButton("filterShowResolved");
        blockButton("filterShowAll");
        blockTypeButton();
    }
}

function showHeatMapOptions(value) {
    var hmButton = document.getElementById("filterHeatMap");
    if (value) {
        showHeatMapSliders();
        hmButton.style.backgroundImage = "url('../img/icons/disabledHeatMapIcon.png')";
    } else {
        hideHeatMapSliders();
        hmButton.style.backgroundImage = "url('../img/icons/heatMapIcon.png')";
    }
}

function changeRadius(value) {
    heatMap.set("radius", value);
}

function changeOpacity(value) {
    value = value / 10;
    heatMap.set("opacity", value);
}

function setMapOnAll(map) {
    for(let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
    if(map) {
        cluster.addMarkers(markers);
    } else {
        cluster.clearMarkers();
    }
}

function setMapOnAllResolved(map) {
    for(let i = 0; i < resolvedMarkers.length; i++) {
        resolvedMarkers[i].setMap(map);
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
    var btnCluster = document.getElementById("filterShowAll");
    if (cluster.getMap()) {
        blockTypeButton();
        cluster.setMap(null);
        btnCluster.style.backgroundImage = "url('../img/icons/disabledEyeIcon.png')";
    } else {
        unblockTypeButton();
        cluster.setMap(map);
        btnCluster.style.backgroundImage = "url('../img/icons/eyeIcon.png')";
    }
}

function toggleShowResolved() {
    var btnResolved = document.getElementById("filterShowResolved");
    showResolved = !showResolved;
    disableAllSelectedTypes();
    clearScreen();
    if(showResolved) {
        if(resolvedMarkers && resolvedMarkers.length > 0) {
            setMapOnAll(null);
            setMapOnAllResolved(map);
            blockButton("filterHeatMap");
            blockButton("filterShowAll");
            btnResolved.innerHTML = "Não resolvidos"
            btnResolved.style.background = "url('../img/icons/disabledSolvedIcon.png')";
        } else {
            var req = new XMLHttpRequest();
            req.open('GET', '/map/getResolved/', true);
            req.setRequestHeader('Content-Type', 'plain/text;charset=UTF-8');

            req.onreadystatechange = function() {
                if (req.readyState == 4 && req.status == 200) {
                    var response = JSON.parse(req.responseText);
                    resolvedPoints = response;
                    setMapOnAll(null);
                    loadMarkers(true);
                    blockButton("filterHeatMap");
                    blockButton("filterShowAll");
                    btnResolved.innerHTML = "Não resolvidos"
                    btnResolved.style.background = "url('../img/icons/disabledSolvedIcon.png')";
                }
            }
            req.send();
        }
    } else {
        setMapOnAll(map);
        setMapOnAllResolved(null);
        unblockButton("filterHeatMap");
        unblockButton("filterShowAll")
        btnResolved.innerHTML = "Resolvidos"
        btnResolved.style.background = "url('../img/icons/solvedIcon.png')";
    }
    refreshMap();
}

function showSelectedType(type) {
    computeComplexMathCalculus(type);
    var ele = document.getElementById('type'+type);
    if (ele.className.split(" ")[1] == "btn"+type) {
        ele.className = "btnMenu btn"+type+"Pressed";
        isShowSelectedOnly++;
        if (isShowSelectedOnly == 1) {
            if (showResolved) {
                setMapOnAllResolved(null);
            } else {
                setMapOnAll(null);
            }
        }
    } else {
        ele.className = "btnMenu btn"+type;
        isShowSelectedOnly--;
        if (isShowSelectedOnly == 0) {
            if (showResolved) {
                setMapOnAllResolved(map);
            } else {
                setMapOnAll(map);
            }
            refreshMap();
        }
    }

    var m;
    if (showResolved) {
        m = resolvedMarkers;
    } else {
        m = markers;
    }

    for(let i = 0; i < m.length; i++) {
        if(m[i].id.split("@")[0] == type) {
            if(m[i].getMap()) {
                m[i].setMap(null);
            } else {
                m[i].setMap(map);
            }
        }
    }
}

function disableAllSelectedTypes() {
    const type = ["Depredation", "Road", "Leak", "Garbage", "Flood"];
    type.forEach(function (t) {
        var button = document.getElementById("type"+t);
        button.className = "btnMenu btn"+t;
    });
    isShowSelectedOnly = 0;
    setMapOnAll(map);
}

function refreshMap() {
    map.setCenter(defaultMapCenter);
    if (map.getZoom() == 5) {
        map.setZoom(4);
    } else {
        map.setZoom(5);
    }
}

async function performAdminLogin() {
    const login = await document.getElementById('adminLoginName').value;
    const pass = await document.getElementById('adminLoginPass').value;

    let url = '/admin/login';
    let h = new Headers();
    h.append('Content-type', 'application/json');

    let json = { email: login, password: pass };
    let req = new Request(url, {
        headers: h,
        body: JSON.stringify(json),
        method: 'POST'
    });
    const response = await fetch(req);

    if(response.ok) {
        if(response.status == 200) {
            const res = await response.json();
            adminToken = res.token;

            if (res.status == 'FirstLogin') {
                (await document.getElementById('adminChangePassword')).style.visibility = 'visible';
                (await document.getElementById('lname')).value = '';
            } else {
                applyAdminInterface();
            }
        }
    } else {
        window.alert("Erro ao realizar o login!\nPor favor verifique seus dados e tente novamente!");
    }
}

async function performAdminPasswordChange() {
    const oldPass = await document.getElementById('fOldPass').value;
    const newPass = await document.getElementById('fNewPass').value;
    const confirm = await document.getElementById('fConfirmPass').value;

    if (newPass == confirm) {
        let url = '/admin/changePassword';
        let h = new Headers();
        h.append('Content-type', 'application/json');
        h.append('authorization', 'Bearer ' + adminToken);

        let json = { oldPass: oldPass, newPass: newPass };
        let req = new Request(url, {
            headers: h,
            body: JSON.stringify(json),
            method: 'POST'
        });
        const res = await fetch(req);

        if (res.ok) {
            if (res.status == 200) {
                (await document.getElementById('adminChangePassword')).style.visibility = 'hidden';
            }
        } else {
            window.alert("Erro ao trocar a senha!\nVerifique seus dados e tente novamente!\nAh e a senha nova deve conter mais que 3 caracteres");
        }
    }
}

function openImageControl(id) {
    const div = document.getElementById('deleteReportDiv');
    div.style.visibility = "visible";
    idToBeDeleted = id;
}

function cancelDelete() {
    idToBeDeleted = undefined;
}

async function resolveLocation(id) {
    let url = '/admin/resolveReport';
    let h = new Headers();
    h.append('Content-type', 'application/json');
    h.append('authorization', 'Bearer ' + adminToken);

    let json = { resolvedLocation: id };
    let req = new Request(url, {
        headers: h,
        body: JSON.stringify(json),
        method: 'POST'
    });
    const response = await fetch(req);
    if(response.ok) {
        if(response.status == 200) {
            prepareToRefreshMarkers();
            window.alert("Posição marcada como resolvida!");
        }
    }
}

async function sendDeleteReportRequest(text, blockUser) {
    if(!idToBeDeleted)
        return;

    let url = '/admin/deleteReport';
    let h = new Headers();
    h.append('Content-type', 'application/json');
    h.append('authorization', 'Bearer ' + adminToken);

    let json = { id: idToBeDeleted, text: text, blockUser: blockUser };
    let req = new Request(url, {
        headers: h,
        body: JSON.stringify(json),
        method: 'POST'
    });
    const response = await fetch(req);
    if(response.ok) {
        if(response.status == 200) {
            prepareToRefreshMarkers();
            window.alert("Reporte deletado com sucesso!");
            const e = document.getElementById('deleteReportDiv');
            e.style.visibility = 'hidden';
            return;
        }
    }
    window.alert("Erro ao excluir, por favor tente navamente");
}

function prepareToRefreshMarkers() {
    var req = new XMLHttpRequest();
    req.open('GET', '/map/getReports', true);
    req.setRequestHeader('Content-Type', 'plain/text;charset=UTF-8');
    req.send();

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            var response = JSON.parse(req.responseText);
            points = response;
            refreshMarkers();
        }
    }
}

function refreshMarkers() {
    sideBarVisible(false);
    clearCurrentSideBar();
    closeAddress();
    setMapOnAll(null);
    markers = [];
    loadMarkers(false);
    setMapOnAll(map);
}

function openImageZoom(id) {
    const zoomDiv = document.getElementById('imageZoomDiv');
    var report;
    for(var i = 0; i < pointInfo.length; i++) {
        if(pointInfo[i].reportId == id) {
            report = pointInfo[i];
            break;
        }
    }

    //Append image to div
    var img = document.createElement("img");
    img.id = 'zoomImg';
    img.src = "data:image/jpg;base64, " + report.image;
    img.style.width = "500px";
    img.style.height = "500px";
    img.style.border = "3px solid black";
    img.style.objectFit = "contain";

    //Append user description to div
    var desc = document.createElement('p');
    desc.id = 'zoomDesc';
    desc.style.fontSize = '20px';
    desc.innerHTML = 'Descrição: ' + report.description;

    var btnClose = document.createElement('button');
    btnClose.id = 'btnResolve';
    btnClose.innerHTML = "Fechar";
    btnClose.onclick = function() { closeZoom(true); };

    zoomDiv.appendChild(img);
    zoomDiv.appendChild(desc);
    zoomDiv.appendChild(btnClose);

    //Id admin append delete button
    if(adminToken != undefined && adminToken.length > 0) {
        var deleteThisBtn = document.createElement('button');
        deleteThisBtn.id = 'btnResolve';
        deleteThisBtn.innerHTML = 'Deletar esse reporte';
        deleteThisBtn.onclick = function() {
            closeZoom(false);
            openImageControl(id);
        };
        zoomDiv.appendChild(deleteThisBtn);
    }

    sideBarVisible(false);
    zoomDiv.style.visibility = 'visible';
}

function closeZoom(visible) {
    const zoomDiv = document.getElementById('imageZoomDiv');
    zoomDiv.innerHTML = '';
    zoomDiv.style.visibility = 'hidden';
    sideBarVisible(visible);
}

function loadAddressInfo(marker) {
    geocodeLatLng(marker.getPosition().lat(), marker.getPosition().lng(), true);
}

function closeAddress() {
    document.getElementById('address-text').innerHTML = "";

    const address = document.getElementById("address");
    if (address.childElementCount > 1) {
        address.removeChild(address.lastChild);
    }
    address.style.visibility = "hidden";
}

function geocodeLatLng(lat, lng, isShowInfo) {
    const latlng = {
      lat: lat,
      lng: lng,
    };

    geocoder
      .geocode({ location: latlng })
      .then((response) => {
        if (response.results[0]) {
            if (isShowInfo) {
                document.getElementById('address-text').innerHTML = response.results[0].formatted_address;
                document.getElementById('address').style.visibility = "visible";
            } else {
                console.log(response.results[0].formatted_address);
            }
        } else {
          window.alert("No results found");
        }
      })
      .catch((e) => window.alert("Geocoder failed due to: " + e));
}

function openControlPanel() {
    window.open("/controlPanel/Home.html?token="+adminToken);
}