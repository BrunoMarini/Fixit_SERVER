async function requestToBeAdmin() {
    var data = new FormData();
    data.append('institution', document.getElementById("name").value);
    data.append('sector', document.getElementById("sector").value);
    data.append('email', document.getElementById("email").value);
    data.append('phone', document.getElementById("phone").value);
    data.append('desc', document.getElementById("description").value);

    if(await validateInput(data)) {
        //TODO show error message
    } else {
        let url = '/admin/register';
        let h = new Headers();
        h.append('Content-type', 'application/json');

        let json = await convertFdToJson(data);

        let req = new Request(url, {
            headers: h,
            body: json,
            method: 'POST'
        });

        const response = await fetch(req);

        if(response.ok) {
            let t = await response.json();
            if(response.status == 200) {
                window.alert("Seu pedido foi realizado com sucesso e será processado pela nossa equipe!\n"+
                                "Clique o botão a baixo para ser redirecionado para nossa página principal!")
                window.location = "/";
            } else {
                window.alert("Erro ao tentar realizar o pedido!\n" +
                                t.message);
            }
        }
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