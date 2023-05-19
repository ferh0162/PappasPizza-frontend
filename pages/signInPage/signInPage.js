console.log("Trying to load signInPage!")
import { makeOptions, handleHttpErrors } from "../../utils.js";
import { REMOTE_API as URL } from "../../settings.js";

export function initSignIn(){

    console.log("Loading initSignIn")

    //Gather user information.
    document.getElementById("btn-signUp").onclick = (event) => {
      event.preventDefault()

      //Reset errormessage
      document.getElementById("error").innerHTML = "";
      //Reset sysmessage
      document.getElementById("sysmessage").innerHTML = ""

      signUp(getUserDetails())
    }

    //Show or hide password.
    const passwordInput = document.getElementById('password');
    const showPasswordButton = document.getElementById('show-password');
    
    showPasswordButton.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        showPasswordButton.textContent = 'Hide Password';
      } else {
        passwordInput.type = 'password';
        showPasswordButton.textContent = 'Show Password';
      }
    });

}

function getUserDetails(){
    const user = {}

    user.address = {}

    user.firstName = document.getElementById("firstName").value
    user.lastName = document.getElementById("lastName").value
    user.address.street = document.getElementById("street").value
    user.address.zip = document.getElementById("zip").value
    user.address.city = document.getElementById("city").value
    user.phoneNumber = document.getElementById("phoneNumber").value
    user.email = document.getElementById("email").value
    user.username = document.getElementById("username").value
    user.password = document.getElementById("password").value

    console.log(user)

    return user;
}

async function signUp(user) {
  
  const options = makeOptions("POST", user, false) 
  try {
      await fetch(URL +"/users",options).then(handleHttpErrors)
      document.getElementById("sysmessage").innerHTML = "Konto oprettet."
      document.querySelector("form").reset()
  } catch (err) {
      document.getElementById("error").innerHTML = err
  }
}
