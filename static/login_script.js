function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
email_field = document.getElementById("email_input");
password_field = document.getElementById("password_input");
error_info = document.getElementById("error-info");
error_info.id = "close";

function update_error_info(text = String){
    error_info.innerHTML = text;
    if (error_info.innerHTML.length > 0){
        error_info.id = "";
    }else{
        error_info.id = "close";
    }
}

function update_field_status(event){
    let email_error_message = "";
    let password_error_message = "";
    let email_validation_response = validarEmail(email_field.value);
    if (email_validation_response == true){
        email_field.className = "input_correct";
        email_error_message = "";
    }if(email_validation_response == false){
        email_field.className = "input_incorrect";
        email_error_message = "Email invalido";
    }if(email_field.value.length <= 1){
        email_field.className = ""; 
        email_error_message = "";
    }

    if (password_field.value.length < 10 && password_field.value.length > 0){
        password_error_message = "A senha precisa ter 10+ caracteres";
        password_field.className = "input_incorrect";
    }else{
        password_error_message = "";
        password_field.className = "input_correct";
    }
    if (password_field.value.length == 0){
        password_field.className = "";
    }
    if (password_error_message.length > 0){
        update_error_info(password_error_message);
    }
    if (email_error_message.length > 0){
        update_error_info(email_error_message);
    }if (password_error_message.length + email_error_message.length < 1){
        update_error_info("");
    }
    
    
};
email_field.addEventListener("change",update_field_status);
password_field.addEventListener("change",update_field_status);
password_field.addEventListener("focusin",function(event){
    password_field.type = "text";
})
password_field.addEventListener("focusout", function(event){
    password_field.type = "password";
})