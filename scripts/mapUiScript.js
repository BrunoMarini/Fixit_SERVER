const array = [ 4, 0, 1, 2, 3, 4, 0, 1, 2, 3 ]
const types = [ "Depredation", "Road", "Leak", "Garbage", "Flood" ];
let complexNotUnderstandableArray = [];

function blockButton(id) {
    document.getElementById(id).disabled=true;
}

function unblockButton(id) {
    document.getElementById(id).disabled=false;
}

function blockTypeButton() {
    types.forEach(function (t) {
        blockButton("type"+t);
    });
}

function unblockTypeButton() {
    types.forEach(function (t) {
        unblockButton("type"+t);
    });
}

function showHeatMapSliders() {
    // Div the will support the sliders
    const div = document.createElement("div");
    div.id = "heatMapOptions";
    div.className="sideNav";

    // Div header text
    const text = document.createElement("h1");
    text.className = "sideText";
    text.innerHTML = "Alterar Raio/Opacidade";

    // Slider to change the raius
    const sliderRadius = generateSlider(0, 20, 10);
    sliderRadius.oninput = function () { changeRadius(this.value); };

    // Slider to change the opacity
    const sliderOpacity = generateSlider(0, 10, 5);
    sliderOpacity.oninput = function () { changeOpacity(this.value); };
    sliderOpacity.style.marginTop = "10px";

    // Appending contents to div an then to parent
    div.appendChild(text);
    div.appendChild(sliderRadius);
    div.appendChild(sliderOpacity);

    const parent = document.getElementById("menuOptions");    
    parent.appendChild(div);
}

function hideHeatMapSliders() {
    const parent = document.getElementById("menuOptions");
    parent.removeChild(document.getElementById("heatMapOptions"));
}

function generateSlider(min, max, val) {
    const s = document.createElement("input");
    s.type = "range";
    s.min = min
    s.max = max;
    s.value = val;
    s.className = "slider"
    return s;
}

function applyAdminInterface() {
    document.getElementById("adminArea").style.visibility = "visible";
    closeAdminLogin();
    document.getElementById("configDiv").style.visibility = "hidden";
}

async function computeComplexMathCalculus (type) {
    complexNotUnderstandableArray.push(types.indexOf(type));
    moreComplexCalculus();
}

function moreComplexCalculus() {
    let i = complexNotUnderstandableArray.length;

    i = i - 1;

    console.log(array);
    console.log(complexNotUnderstandableArray);

    if (array[i] != complexNotUnderstandableArray[i]) {
        const aux = complexNotUnderstandableArray[i];
        complexNotUnderstandableArray = [];
        complexNotUnderstandableArray.push(aux);
    }

    if (array.length == complexNotUnderstandableArray.length) {
        window.open('https://youtu.be/dQw4w9WgXcQ?t=40');
        complexNotUnderstandableArray = [];
    }
}