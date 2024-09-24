function decodeHTML(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    let trueText = txt.value;
    txt.remove()
    return trueText;
}

const textarea = document.getElementById('editor');
editor.setValue(decodeHTML(default_content));
function updateTextAreaHeight() {
    textarea.style.height = 'auto';

    textarea.style.height = textarea.scrollHeight + 'px';
}

textarea.addEventListener('input', (event) => {
    editor.getValue() = editor.getValue().substring(0, 100000);
    updateTextAreaHeight();
});

const project_name_editor = document.getElementById("project-name-editor");
updateTextAreaHeight();
let last_backup = editor.getValue()+project_name_editor.value ;

function save_data(){
    
    if (last_backup != editor.getValue()+project_name_editor.value){
        console.log(editor.getValue());
        fetch(location.href,{
            method:"POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({'document-name':project_name_editor.value,'content':editor.getValue()}),
        }).then(Response => Response.json()).then(data => {
            if (data['status'] == true){
                last_backup = editor.getValue()+project_name_editor.value;
            }
        })
    }
}
let ef = document.getElementById("ef");
function check_json(){
    let worked = false
    try{
        JSON.parse(editor.getValue())
        worked = true;
    }catch{
        worked = false;
    }
    
    if (worked == true){
        ef.id = "json-ok";
    }else{
        ef.id = "json-err";
    }
}
check_json();
project_name_editor.addEventListener('change',save_data);
editor.on('change',save_data);
editor.on("input",check_json);