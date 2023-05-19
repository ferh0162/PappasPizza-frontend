import {REMOTE_API as API_URL} from "../../settings.js"
import {handleHttpErrors} from "../../utils.js"
import { roleHandler } from "../../index.js"

console.log("loginpage js is loaded!!!!")

const URL = API_URL + "/auth/login"
//Make sure that the URL is the correct one.

export function initLogin() {
  console.log("attempting Logging in")
  document.getElementById("login-btn").onclick = login
}

export async function logout(){
  
  //document.getElementById("login-id").style.display="block"
  //document.getElementById("logout-id").style.display="none"

/*
  document.getElementById("adminCalendar-id").style.display="none"
  document.getElementById("userCalendar-id").style.display="none"
  document.getElementById("addUser").style.display="none"
  document.getElementById("editUser").style.display="none"
  document.getElementById("showUsers").style.display="none"
  */
 //Make sure that whenever a client is logged out, that all the pages available to the anonymous user is showing.
  
  localStorage.clear()

  window.router.navigate("")

  await roleHandler();

  

}

export function checkAdmin(){
    return localStorage.getItem("roles") == "ADMIN"
}


async function login(evt) {
  document.getElementById("error").innerText = ""

  //Added DOMPurify.sanitize to add security. With this we prevent cross-site scripting (XSS) attacks and other types of malicious code injection.
  const username = DOMPurify.sanitize(document.getElementById("username").value)
  const password = DOMPurify.sanitize(document.getElementById("password").value)

  


  //const userDto = {username:username,password:password}
  const userDto = { username, password }

  const options = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(userDto)
    //Give it the correct userDto
  }
  try {
    const response = await fetch(URL, options).then(res=>handleHttpErrors(res))
    localStorage.setItem("user",response.username)
    localStorage.setItem("token",response.token)
    localStorage.setItem("roles",response.roles)

    //document.getElementById("login-id").style.display="none"
    //document.getElementById("logout-id").style.display="block"
    //Makes the correct button show, based on if the user is logged in or not.
    
    console.log(localStorage.getItem("roles"))

    await roleHandler();

    //Have to fix the issue where the rolehandler removes the "/", since it's going there by default whenever login is successful.
    if (localStorage.getItem("roles", response.roles)=="ADMIN") {
      window.router.navigate("/all-orders")
    } else if(localStorage.getItem("roles", response.roles)=="USER") {
      window.router.navigate("/")
    }

  } catch (err) {
    //Make sure that the error ID is the correct one.
    document.getElementById("error").innerText = err.message
  }

}