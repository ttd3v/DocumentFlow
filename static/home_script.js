let piw = document.getElementById("piw");
let ppw = document.getElementById("ppw");
let piw_frame = document.getElementById("on");
let ppw_frame = document.getElementById("ppw");
let piw_focused = false;
let ppw_focused = false;
let projects_list = document.getElementById("projects");
let project_beeing_edited = null;





let templates_count = 1;
function template_project(project_name,project_id,project_type){
    root = document.createElement('div');
    icon = document.createElement('img');
    paragraph = document.createElement('a');
    button = document.createElement('button');
    button_core_icon = document.createElement('img');

    root.appendChild(icon);
    root.appendChild(paragraph);
    root.appendChild(button);
    button.appendChild(button_core_icon);

    root.className = "project-item";
    root.id = `root:${project_id}`
    
    icon.className="project-icon";
    icon.alt='';
    icon.src=images[project_type];

    console.log(project_name);
    
    button.className='project-info';
    button.id = project_id;
    
    button_core_icon.alt='';
    button_core_icon.src=images['dots'];
    button_core_icon.style.height = "100%";

    paragraph.className='project-title';
    paragraph.innerHTML=project_name;
    paragraph.addEventListener("mouseover", (event) => {
        if(paragraph.InnerHTML != project_name){
            paragraph.InnerHTML = project_name;
        }
    })

    // paragraph.addEventListener("click",(event) => {
    //     location.location = String(URL).replace("/",`/${project_id}`)
    // })
    paragraph.href = project_id;

    return [root,button];
}
let projects_frame = document.getElementById("projects");
for (let info of docs_info){
    templates_count += 1;
    let ar = template_project(info[2],info[0],info[3]);
    let widget = ar[1]
    let frame = ar[0]
    widget.onclick = () => {
        if (!piw_focused){
            piw_focused = true;
            piw_frame.id = "on";
            piw.className = "project-info-window";
            project_beeing_edited = widget.id;
            console.log("pbe; ",project_beeing_edited);
        }
    };
    setTimeout(() => {
      projects_frame.appendChild(frame);  
    },templates_count*50)
    
}

piw_frame.id = "off";
ppw_frame.id = "off";

document.getElementById("lpiw").onclick= (event) => {
    if (piw_focused){
        piw_focused = false;
        piw_frame.id = "off";
        piw.className = "project-info-window-off";
        project_beeing_edited = null;
        console.log("pbe; ",project_beeing_edited);
    }
};

document.getElementById("cpwb").onclick = (event) => {
    if(ppw_focused){
        ppw_focused = false;
        ppw_frame.id = "off";
        ppw_frame.className = "create-project-window-off";
    }
}

for(let widget of document.getElementsByClassName("frame-create-document-element")){
    widget.addEventListener("click",() => {
        ppw_focused = true;
        ppw_frame.id = "on";
        ppw_frame.className = "create-project-window";
        cpwi.value = widget.id;
        cpwimg.src = images[cpwi.value];
    })
}

let cpwi = document.getElementById("cpwi");
let cpwimg = document.getElementById("cpwimg");
let submit_buttom = document.getElementById("submit-button-identifier");

function cpwi_change(event){
    cpwimg.src = images[cpwi.value]
}
cpwi.addEventListener("change",cpwi_change);
cpwi_change();
submit_buttom.id="";

function update_submit_button_state(){
    let empty = false
    for (let widget of document.getElementsByClassName("cpw-input")){
        if (widget.value.length < 1){
            empty = true
            break
        }
    }
    if(empty == false){
        submit_buttom.id = "active";
    }if (empty == true){
        submit_buttom.id = "";
    }
}
update_submit_button_state();
for (let widget of document.getElementsByClassName("cpw-input")){
    if (widget.type == "text"){
        widget.addEventListener("input",update_submit_button_state);
    }
}

let button_delete = document.getElementById("delete");
if (button_delete){
    button_delete.onclick = (event) =>{
        if (project_beeing_edited != null){
            fetch(location.href,{
                method: "POST",
                body: new URLSearchParams({"action":'delete',"project_id":project_beeing_edited,}),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }).then(Response => Response.json()).then(data => {
                if (data.proceed == 'true'){
                    if (piw_focused){
                        piw_focused = false;
                        piw_frame.id = "off";
                        piw.className = "project-info-window-off";
                        console.log("pbe; ",project_beeing_edited);
                        let to_delete = document.getElementById(`root:${project_beeing_edited}`)
                        if (to_delete){
                            to_delete.remove();
                        }
                        project_beeing_edited = null;
                    }
                    console.log(alert);
                }
            })
        }
    }
}