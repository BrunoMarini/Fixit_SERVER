function requestToBeAdmin() {
    var data = new FormData();
    data.append('institution', document.getElementById("name").value);
    data.append('sector', document.getElementById("sector").value);
    data.append('email', document.getElementById("email").value);
    data.append('phone', document.getElementById("phone").value);
    data.append('desc', document.getElementById("description").value);

    if(validateInput(data)) {
        //TODO show error message
    } else {
        let url = '/admin/register';
        let h = new Headers();
        h.append('Content-type', 'application/json');

        let json = convertFdToJson(data);

        let req = new Request(url, {
            headers: h,
            body: json,
            method: 'POST'
        });

        fetch(req)
            .then((res) => res.json())
            .then((data) => {
                console.log("response: " + data);
            })
            .catch(console.warn);
    }
}

function convertFdToJson(data) {
    let obj = {};
    for(let key of data.keys()) {
        obj[key] = data.get(key);
    }
    return JSON.stringify(obj);
}

function validateInput(data) {
    for(let key of data.keys()) {
        if(!data.get(key))
            return false;
    }

    if(data.get('institution').length < 2 || data.get('sector').length < 2 || data.get('desc') < 50)
        return false;
}