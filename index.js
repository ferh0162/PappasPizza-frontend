import "https://unpkg.com/navigo"  //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js"
import {  setActiveLink, adjustForMissingHash, renderTemplate, loadTemplate } from "./utils.js"


import { testEverything } from "./pages/menuPage/test.js"
import {initReceipts} from "./pages/recepter/recepter.js"
import {initIngredients} from "./pages/ingredients/ingredients.js";
import {initPizzaManagement} from "./pages/pizzaManagement/pizzaManagement.js"

window.addEventListener("load", async () => {

    const templateTest = await loadTemplate("./pages/menuPage/test.html")
    const templateMenu = await loadTemplate("./pages/menu.html")
    const templateRecept = await loadTemplate("./pages/recepter/recepter.html")
    const templateIngredient = await loadTemplate("./pages/ingredients/ingredients.html")
    const templatePizzaManagement = await loadTemplate("./pages/pizzaManagement/pizzaManagement.html")
    
    adjustForMissingHash()

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
        "/test": () => renderTemplate(templateTest, "content"),
        "/menu": () => renderTemplate(templateMenu, "content"),
        
        "/recepter": () => { renderTemplate(templateRecept, "content")
        initReceipts()
        },
        "/ingredients": ()=> {renderTemplate(templateIngredient, "content")
        initIngredients()
        },
        "/pizzaBehandling" : () => {
          renderTemplate(templatePizzaManagement, "content")
          initPizzaManagement()
        }
    })
    .notFound(() => {
      renderTemplate(templateNotFound, "content")
    })
    .resolve()
});

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
      + ' Column: ' + column + ' StackTrace: ' + errorObj);
  }