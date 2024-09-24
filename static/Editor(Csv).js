let editor_frame = document.getElementById("ef");
let project_name_editor = document.getElementById("project-name-editor");
let last_backup = json_content;
function update_data(){
    fetch(location.href,{
      method:'POST',headers:{
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({'document-name':project_name_editor.value,'content':JSON.stringify(json_content),}),
      
    }).then(Response => Response.json()).then(data => {
      if (data['status'] == true){
          last_backup = json_content;
          console.log('data protocol initiated!')
      }
    })
    
}

project_name_editor.addEventListener('change',update_data)

function create_column(KEY, content) {
    let column = document.createElement('div');
    column.className = 'column';
    column.id = `column:${KEY}`;

    let column_name = document.createElement("textarea");
    column_name.className = "column-name";
    column_name.id = `column-name:${content['name']}`;
    column_name.innerHTML = content['name'];


    column.appendChild(column_name);
    editor_frame.appendChild(column);

    column_name.addEventListener('change',() => {
      content['name'] = column_name.value;
      update_data();
    })

    content['rows'].forEach((val, index) => {
        setTimeout(() => {
            let row_name = document.createElement("textarea");
            row_name.className = "row-name";
            row_name.id = `row-name-${name}:${index}`;
            column.appendChild(row_name);
            row_name.value = val;
            row_name.addEventListener("change",() => {
              content['rows'][index] = row_name.value;
              update_data();
            })
        }, 50 * index); // Adiciona um pequeno atraso na criação das linhas
    });
}

Object.keys(json_content).forEach((name__, index) => {
    setTimeout(() => {
        create_column(name__, json_content[name__]);
    }, 50 * index); // Adiciona um pequeno atraso na criação das colunas
});