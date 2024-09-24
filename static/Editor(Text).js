const textarea = document.getElementById('eft');

function updateTextAreaHeight() {
    textarea.style.height = 'auto';

    textarea.style.height = textarea.scrollHeight + 'px';
}

textarea.addEventListener('input', (event) => {
    textarea.value = textarea.value.substring(0, 100000);
    updateTextAreaHeight();
});

const project_name_editor = document.getElementById("project-name-editor");
updateTextAreaHeight();
let last_backup = textarea.value+project_name_editor.value ;

function save_data(){
    
    if (last_backup != textarea.value+project_name_editor.value){
        fetch(location.href,{
            method:"POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({'document-name':project_name_editor.value,'content':textarea.value}),
        }).then(Response => Response.json()).then(data => {
            if (data['status'] == true){
                last_backup = textarea.value+project_name_editor.value;
            }
        })
    }
}

project_name_editor.addEventListener('change',save_data);
textarea.addEventListener('change',save_data);