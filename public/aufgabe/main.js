/*  main.js - Maximilian Schiller 2020 */
const out = document.getElementById('out'),
    signin = document.getElementById('signin'),
    textBtn = document.getElementById('textBtn'),
    urlBtn = document.getElementById('urlBtn'),
    fileBtn = document.getElementById('fileBtn'),
    textDiv = document.getElementById('textDiv'),
    urlDiv = document.getElementById('urlDiv'),
    fileDiv = document.getElementById('fileDiv'),
    selectDiv = document.getElementById('selectDiv'),
    uploadBtn = document.getElementById('uploadBtn'),
    submitBtn = document.getElementById('submitBtn'),
    title = document.getElementById('title'),
    copyBtn = document.getElementById('copyBtn'),
    shareBtn = document.getElementById('shareBtn'),
    copyOut = document.getElementById('copyOut'),
    progressDiv = document.getElementById('progressDiv')
var $body = document.getElementsByTagName('body')[0];

function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

var last = document.getElementById('fileDiv')

document.getElementById("loader").style.display = "none";

var url_string = window.location.href; //window.location.href
var url = new URL(url_string);
var aufgabenId = url.searchParams.get("id")
console.log("Aufgabe: " + aufgabenId)
var role;

function validateForm() {
    if (document.getElementById('select-button').files.length === 0) {
        //console.log(false)
        return false;
    } else {
        //console.log(true)
        return true
    }
}

async function upload() {
    var filledOut = validateForm();
    console.log(filledOut)
    if (filledOut) {
        const fi = document.getElementById('select-button');
        // Check if any file is selected.
        var ran = false;
        if (fi.files.length > 0) {
            for (i in fi.files) {
                var fsize = fi.files.item(i).size;
                var file = Math.round(fsize);
                if (file >= 52428800) { //50mb
                    if (!ran) {
                        alert("Alter was'n das für ne Datei... max 50mb bitte!");
                        ran = true;
                        return;
                    }
                }
            }
            //document.getElementById("loader").style.display = "block";
            progressDiv.style.display = "block";
            document.getElementById('error').innerHTML = `<p>Hochladen...</p>`;
            document.getElementById('form').style.display = "none";
            var form = document.getElementById('upload');
            var xhr = new XMLHttpRequest(); // create XMLHttpRequest
            var data = new FormData(form); // create formData object
            //data.append("filename", document.getElementById('filename').value);
            data.append("id", aufgabenId);
            console.log(data)
            xhr.upload.addEventListener("progress", function(event) {
                if (event.lengthComputable) {
                    var complete = (event.loaded / event.total * 100 | 0);
                    //moveBar(complete)
                    var loaded = formatBytes(event.loaded).split(" ")[0];
                    var total = formatBytes(event.total);
                    document.getElementById("status").innerHTML = `<p>${loaded}/${total}</p>`;
                }
            });
            xhr.onload = function(Event) {
                //document.getElementById("loader").style.display = "none";
                progressDiv.style.display = "none";
                document.getElementById('status').style.display = "none";
                if (xhr.status == 200) {
                    var json = JSON.parse(this.responseText)
                    console.log(json);
                    if (json.status == 200) {
                        document.getElementById('error').innerHTML = `Lösung erfolgreich hochgeladen!`;
                        renderUser()
                            //document.getElementById('form').style.display = "block";
                    } else if (json.status == 405) {
                        document.getElementById('error').innerHTML = `<p class="message" id="message">Nicht angemeldet. Wenn du nicht automatisch weiter geleitet wirst, klicke <a href="/login">hier</a></p>`
                        window.location.replace('/login?ref=' + window.location.pathname + window.location.search)
                    } else if (json.status == 421) {
                        document.getElementById('error').innerHTML = `<p class="message" id="message">Nicht alle Felder ausgefüllt</p>`
                        alert("Bitte Fülle alle Felder aus (Datei und Datei Name Optional)");
                        document.getElementById('form').style.display = "block";
                    } else {
                        document.getElementById('error').innerHTML = `Shit... Es scheint ein Fehler aufgetreten zu sein. Lade bitte die Seite nochmal.`;
                    }
                } else {
                    console.log(xhr.status)
                }

            }
            xhr.open("post", form.action); // open connection
            xhr.send(data);
        } else {
            document.getElementById('error').innerHTML = `<p class="message" id="message">Nicht alle Felder ausgefüllt</p>`
            setTimeout(function() {
                alert("Bitte wähle eine oder mehrere Dateien aus");
            }, 0);
        }
    } else {
        document.getElementById('error').innerHTML = `<p class="message" id="message">Nicht alle Felder ausgefüllt</p>`
        setTimeout(function() {
            alert("Bitte wähle eine oder mehrere Dateien aus");
        }, 0);
    }

}

function moveBar(progress) {
    var elem = document.getElementById("progressBar");
    if (progress >= 100) {
        console.log("finished")
    } else {
        elem.style.width = progress + '%';
        elem.innerHTML = progress * 1 + '%';
    }

}

function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Bytes';
    var k = 1024,
        dm = decimals <= 0 ? 0 : decimals || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


async function authenticate() {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    };
    const response = await fetch('/api/auth/exercise?id=' + aufgabenId, options);
    const json = await response.json();
    if (json.status == 200) {
        console.log(json);
        role = json.user.role
        document.getElementById('fach').innerHTML = json.data.subject + " Aufgabe (" + json.data.class + ")";
        document.getElementById('text').innerHTML = json.data.text;
        var abgabe = new Date(json.data.deadline)
        document.getElementById('abgabe').innerHTML = abgabe.toLocaleDateString();
        document.title = json.data.subject + " Aufgabe (" + json.data.class + ")"
        if (json.data.fileUrl != undefined) {
            //<span onclick="download();" id="abcdefg" title="Aufgabe Herunterladen" class="fas fa-cloud-download-alt icon"></span>
            var p = document.createElement('p');
            p.hidden = "";
            p.innerHTML = `
            <span onclick="document.getElementById('${"link_" + json.data._id}').click()" id="${json.data._id}" title="Aufgabe Herunterladen" class="fas fa-cloud-download-alt iconDown"></span>
            <a id="link_${json.data._id}" href="${json.data.fileUrl} hidden=""></a>
            `
            document.getElementById('abgabe').parentElement.appendChild(p);
        }
        
        //renderUser();
        if(role == 'user'){
            document.getElementById('form').style.display = "block"
            var newReiter = document.getElementById('new');
            newReiter.style.display = 'none'
            renderUser()
        }else{
            renderTeacher()
        }
    } else if (json.status == 403) {
        console.log(json);
        var message = createElement('div', 'message', 'message')
        last.parentElement.appendChild(message)
        message.innerHTML = `<p class="message" id="message">Nicht angemeldet. Wenn du nicht automatisch weiter geleitet wirst, klicke <a href="/login">hier</a></p>`
        window.location.replace('/login?ref=' + window.location.pathname + window.location.search)
    } else if (json.status == 405) {
        console.log(json);
        var message = createElement('div', 'message', 'message')
        last.parentElement.appendChild(message)
        message.innerHTML = `<p class="message" id="message">Nicht angemeldet. Wenn du nicht automatisch weiter geleitet wirst, klicke <a href="/login">hier</a></p>`
        window.location.replace('/login?ref=' + window.location.pathname + window.location.search)
    } else if (json.status == 404) {
        console.log(json);
        var message = createElement('div', 'message', 'message')
        last.parentElement.appendChild(message)
        message.innerHTML = `<p class="message" id="message">Diese Aufgabe gibt es nicht</p>`
        window.location.replace('/')
    } else {
        var message = createElement('div', 'message', 'message')
        last.parentElement.appendChild(message)
        message.innerHTML = `<p class="message" id="message">Shit... Es scheint ein Fehler aufgetreten zu sein. Lade bitte die Seite nochmal.</p>`
        window.location.replace('/login')
    }
}

async function renderTeacher() {
    document.querySelectorAll('.solution').forEach(e => e.remove());
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    };
    const response = await fetch('/api/get/table?id=' + aufgabenId, options);
    const json = await response.json();
    if (json.status == 200) {
        console.log(json);
        document.getElementById('solutionHead').innerHTML = `Lösungen (<a href="/api/v1/generate/pdf?id=${json.exercise}">PDF</a>)`
        var customers = new Array();

        customers.push(["Name", "Abgegeben am", "", "Status"]);
        for (i in json.data) {
            customers.push([json.data[i].name, json.data[i].createdAt, json.data[i].fileUrl, json.data[i].status, json.data[i]._id]);
        }
        console.log(customers)
            //Create a HTML Table element.
        var table = document.createElement("table");
        //Get the count of columns.
        var columnCount = customers[0].length;
        //Add the header row.
        var row = table.insertRow(-1);
        for (var i = 0; i < columnCount; i++) {
            var headerCell = document.createElement("TH");
            headerCell.innerHTML = customers[0][i];
            row.appendChild(headerCell);
        }
        //Add the data rows.
        for (var i = 1; i < customers.length; i++) { //Rows
            row = table.insertRow(-1);
            for (var j = 0; j < columnCount; j++) { //Column
                var cell = row.insertCell(-1);
                if(j == 0){
                    if (customers[i][j] != null) {
                        cell.innerHTML = customers[i][j];
                    }
                }else if(j == 1){
                    if (customers[i][j] != null) {
                        var abgabe = new Date(customers[i][j])
                        cell.innerHTML = abgabe.toLocaleString();
                    }else{
                        cell.innerHTML = "-"
                    }
                }else if (j == 2) {
                    console.log(customers[i][2])
                    if(customers[i][2] != null){
                        var btn = document.createElement('span');
                        btn.id = customers[i][j];
                        btn.className = "fas fa-cloud-download-alt cloud";
                        btn.title = "Lösung Herunterladen";
                        btn.onclick = downloadFile;
                        cell.appendChild(btn);
                    }
                } else if (j == 3) {
                    /* <span onclick="document.getElementById('link_test').click()" id="abcdefg" title="Lösung Herunterladen" class="fas fa-check-circle no"></span>
                        <a id="link_test" href="/new" hidden=""></a> */
                    var btn = document.createElement('span');
                    //console.log(customers[i])
                    if (customers[i][3]) {
                        btn.className = "fas fa-check-circle yes";
                        btn.title = "Abgegeben";
                    } else {
                        btn.className = "fas fa-times-circle no";
                        btn.title = "Nicht Abgegeben";
                    }
                    cell.appendChild(btn);
                }

            }
        }

        var dvTable = document.getElementById("dvTable");
        dvTable.innerHTML = "";
        dvTable.appendChild(table);
    } else if (json.status == 403) {
        console.log(json);
        var message = createElement('div', 'message', 'message')
        last.parentElement.appendChild(message)
        message.innerHTML = `<p class="message" id="message">Nicht angemeldet. Wenn du nicht automatisch weiter geleitet wirst, klicke <a href="/login">hier</a></p>`
        window.location.replace('/login?ref=' + window.location.pathname + window.location.search)
    } else if (json.status == 405) {
        console.log(json);
        var message = createElement('div', 'message', 'message')
        last.parentElement.appendChild(message)
        message.innerHTML = `<p class="message" id="message">Nicht angemeldet. Wenn du nicht automatisch weiter geleitet wirst, klicke <a href="/login">hier</a></p>`
        window.location.replace('/login?ref=' + window.location.pathname + window.location.search)
    } else if (json.status == 404) {
        console.log(json);
        document.getElementById('solutionHead').innerHTML = "Lösung Hochladen:"
    } else {
        var message = createElement('div', 'message', 'message')
        last.parentElement.appendChild(message)
        message.innerHTML = `<p class="message" id="message">Shit... Es scheint ein Fehler aufgetreten zu sein. Lade bitte die Seite nochmal.</p>`
        window.location.replace('/login')
    }
}

function downloadFile(){
    window.open(this.id, "_blank");
}

async function renderUser() {
    document.querySelectorAll('.solution').forEach(e => e.remove());
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    };
    const response = await fetch('/api/get/solutions?id=' + aufgabenId, options);
    const json = await response.json();
    if (json.status == 200) {
        console.log(json);
        document.getElementById('solutionHead').innerHTML = "Deine Lösungen:"
        for (i in json.data) {
            var div = document.createElement('div');
            div.id = json.data._id;
            div.className = "solution"
            var date = new Date(json.data[i].createdAt)
            div.innerHTML = `
                <p class="accent name">${json.data[i].files.fileName + "." + json.data[i].files.type}</p>
                <p class="accent abgabe">${date.toLocaleString()}</p>
            `
            document.getElementById('solutionHead').parentElement.insertBefore(div, document.getElementById('form'))
        }

    } else if (json.status == 403) {
        console.log(json);
        var message = createElement('div', 'message', 'message')
        last.parentElement.appendChild(message)
        message.innerHTML = `<p class="message" id="message">Nicht angemeldet. Wenn du nicht automatisch weiter geleitet wirst, klicke <a href="/login">hier</a></p>`
        window.location.replace('/login?ref=' + window.location.pathname + window.location.search)
    } else if (json.status == 405) {
        console.log(json);
        var message = createElement('div', 'message', 'message')
        last.parentElement.appendChild(message)
        message.innerHTML = `<p class="message" id="message">Nicht angemeldet. Wenn du nicht automatisch weiter geleitet wirst, klicke <a href="/login">hier</a></p>`
        window.location.replace('/login?ref=' + window.location.pathname + window.location.search)
    } else if (json.status == 404) {
        console.log(json);
        document.getElementById('solutionHead').innerHTML = "Lösung Hochladen:"
        document.getElementById('form').style.display = "block"
    } else {
        var message = createElement('div', 'message', 'message')
        last.parentElement.appendChild(message)
        message.innerHTML = `<p class="message" id="message">Shit... Es scheint ein Fehler aufgetreten zu sein. Lade bitte die Seite nochmal.</p>`
        window.location.replace('/login')
    }
}

function copy(resp) {
    var $tempInput = document.createElement('INPUT');
    $body.appendChild($tempInput);
    $tempInput.setAttribute('value', resp)
    $tempInput.select();
    document.execCommand('copy');
    $body.removeChild($tempInput);
    copyBtn.setAttribute('class', 'btn btn--primary uppercase copy');
    copyBtn.innerHTML = 'Copied!';
}

function createElement(elem, className, id, text, title) {
    var element = document.createElement(elem);
    element.className = className;
    if (elem == 'p') {
        var node = document.createTextNode(text);
        element.appendChild(node);
    } else if (elem == 'img') {
        element.src = text
        element.title = title
    } else if (elem == 'input') {
        element.placeholder = text
    } else if (elem == 'div' && className == "device parent") {
        element.id = id;
    } else if (elem == 'a') {
        element.href = id;
        var node = document.createTextNode(text);
        element.appendChild(node);
    }
    return element
}

function AvoidSpace(event) {
    var k = event ? event.which : window.event.keyCode;
    if (k == 32) return false;
}

setInterval(function() {
    var dot = document.getElementById("dot")
    dot.className = (dot.className == 'green') ? 'blink' : 'green';
}, 1000);