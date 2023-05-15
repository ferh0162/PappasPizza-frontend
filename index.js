import "https://unpkg.com/navigo"  //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js"
import {  setActiveLink, adjustForMissingHash, renderTemplate, loadTemplate } from "./utils.js"


import { testEverything } from "./pages/menuPage/test.js"
import {initReceipts} from "./pages/recepter/recepter.js"
import { initLogin, logout, checkAdmin } from "./pages/loginPage/loginPage.js"

let templates = {}



window.addEventListener("load", async () => {

  templates.templateMenu = await loadTemplate("./pages/menu.html")
  templates.templateTest = await loadTemplate("./pages/menuPage/test.html")
  templates.templateRecept = await loadTemplate("./pages/recepter/recepter.html")
  templates.templateLogin = await loadTemplate("./pages/loginPage/loginPage.html")


  /*const templates = {
    "templateTest": await loadTemplate("./pages/menuPage/test.html"),
    "templateMenu": await loadTemplate("./pages/menu.html"),
    "templateRecept": await loadTemplate("./pages/recepter/recepter.html"),
    "templateLogin": await loadTemplate("./pages/loginPage/loginPage.html")
  }*/

  console.log("The site is updated!")
    
    adjustForMissingHash()

    await routeHandler()


});

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
      + ' Column: ' + column + ' StackTrace: ' + errorObj);
  }

  async function routeHandler(){

    console.log("Routehandler has run!")

    const router = new Navigo("/", { hash: true });

    window.router = router
   
    router
    .hooks({
      before(done, match) {
        setActiveLink("menu", match.url)
        done()
      }
    })
    .on({ 
        //For very simple "templates", you can just insert your HTML directly like below
        "/": () => document.getElementById("content").innerHTML =
          `<h2>Home</h2>
        <p style='margin-top:2em'>
        This is the content of the Home Route <br/>
        Observe that this is so simple that all HTML is added in the on-handler for the route. 
        </p>
       `,
        "/menu": () => renderTemplate(templates.templateMenu, "content"),
        
        "/recepter": () => { renderTemplate(templates.templateRecept, "content")
        initReceipts()
        },
        "/login": () => {
          renderTemplate(templates.templateLogin, "content")
          console.log("login loaded!")
          initLogin()
        },
        "/signIn" : () => {
          initSignIn()
        },
        "/order" : () => {
          initOrder()
        }
        //"/test": () => renderTemplate(templates.templateTest, "content")
    })
    await roleHandler()
    router
    .notFound(() => {
      renderTemplate(templates.templateNotFound, "content")
    })
    .resolve()


    

  }


export async function roleHandler(){


    if(localStorage.getItem("roles")){

      //Everything anyone but the ANONYMOUS can access.

      console.log("roles found!")
      
      //Removes login, since role was found.
      document.getElementById("login-id").style.display = "none"
      console.log("deleting login!")
      window.router.off("/login")

      //Shows logout, since role was found.
      document.getElementById("logout-id").style.display = "block"
      window.router.on({
      "/logout": () => {
        console.log(templates)
        renderTemplate(templates.templateLogin, "content")
        logout()
      }})

            //Implementér funktionalitet hvor login bliver fjernet hvis der er en rolle, siden at den er null hvis det er anonymous.

            //Der skal også være de gældende "routes", hvor ADMIN som eksempel ikke kan se ting, som en almindelig user kan og vice versa.

            if(localStorage.getItem("roles") == "USER"){

              //Everything where USER can access.

              //Removes Sign-in
              window.router.off("/signIn")
              
              document.getElementById("test-id").style.display = "block"
              window.router.on({
                "/test": () => renderTemplate(templates.templateTest, "content")
              })

          } else if(localStorage.getItem("roles") == "ADMIN"){
            /*
            
            //Everything where ADMIN can access. If you want to add a route for ADMIN, do it here;

            //EXAMPLE: TO ADD A ROUTE
          
              document.getElementById("example-id").style.display = "block"
              window.router.on({
                "/example": () => {
                renderTemplate(templates.templateExample, "content")
                innitExample() <-- Remember to run your innit JS after the template render.
                }
              })
              
            //EXAMPLE: TO REMOVE A ROUTE

            document.getElementById("example-id").style.display = "none" //ONLY IF THE ELEMENT EXISTS ON THE HEADER
            window.router.off("/example")

            */

            //Removes Sign-in
            window.router.off("/signIn")

            //Removes Order
            window.router.off("/order")

            //Removes test
            document.getElementById("test-id").style.display = "none"
              window.router.off("/test")
            console.log("ADMIN found!")
            console.log("Removing test")

          }
          
        } else {
          //If no role is found, the user is anonymous.

          //Everything where ANONYMOUS can access.


          console.log("ANONYMOUS found!")
          //So the login is shown, and logout is removed.
          document.getElementById("logout-id").style.display = "none"
          window.router.off("/logout")


          //Adds back login, since now the user is ANONYMOUS
          document.getElementById("login-id").style.display = "block"
          window.router.on({
          "/login": () => {
            renderTemplate(templates.templateLogin, "content")
            console.log("login loaded!")
            initLogin()
          }})


          //Removing test because no role is found.
          console.log("removing test")
          document.getElementById("test-id").style.display = "none"
          window.router.off("/test")

          
        }
      }
      