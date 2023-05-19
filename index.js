import "https://unpkg.com/navigo"; //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js";
import {
  setActiveLink,
  adjustForMissingHash,
  renderTemplate,
  loadTemplate,
} from "./utils.js";

import { testEverything } from "./pages/aboutPage/aboutPage.js";
import { initReceipts } from "./pages/recepter/recepter.js";

import { initLogin, logout, checkAdmin } from "./pages/loginPage/loginPage.js";
import { innitUnconfirmedOrders } from "./pages/orderConfirmation/orderConfirmation.js";
import { innitAllOrders } from "./pages/allOrders/allOrders.js";
import { innitOrderReceiptChef } from "./pages/orderReceiptChef/orderReceiptChef.js";
import { initMenu } from "./pages/shoppingCart.js";
import { initSignIn } from "./pages/signInPage/signInPage.js";
import { innitOrder as initOrder } from "./pages/order/order.js";
import { innitChatGpt } from "./pages/chatGPTPage/chatGPTPage.js";
import { initAddPizza } from "./pages/addPizzasPage/addPizzasPage.js";
import { initIngredients } from "./pages/ingredients/ingredients.js";
import { initPizzaManagement } from "./pages/pizzaManagement/pizzaManagement.js";

let templates = {};

window.addEventListener("load", async () => {
  templates.templateMenu = await loadTemplate("./pages/menu.html");
  templates.templateAbout = await loadTemplate(
    "./pages/aboutPage/aboutPage.html"
  );
  templates.templateRecept = await loadTemplate(
    "./pages/recepter/recepter.html"
  );
  templates.templateLogin = await loadTemplate(
    "./pages/loginPage/loginPage.html"
  );
  templates.templateUnconfirmedOrders = await loadTemplate(
    "./pages/orderConfirmation/orderConfirmation.html"
  );
  templates.templateAllOrders = await loadTemplate(
    "./pages/allOrders/allOrders.html"
  );
  templates.templateOrderReceiptChef = await loadTemplate(
    "./pages/orderReceiptChef/orderReceiptChef.html"
  );
  templates.templateSignIn = await loadTemplate(
    "./pages/signInPage/signInPage.html"
  );
  templates.templateOrder = await loadTemplate("./pages/order/order.html");
  templates.templateChatGpt = await loadTemplate(
    "./pages/chatGPTPage/chatGPTPage.html"
  );
  templates.templateAddPizzas = await loadTemplate(
    "./pages/addPizzasPage/addPizzasPage.html"
  );
  templates.templateIngredient = await loadTemplate(
    "./pages/ingredients/ingredients.html"
  );
  templates.templatePizzaManagement = await loadTemplate(
    "./pages/pizzaManagement/pizzaManagement.html"
  );

  adjustForMissingHash();

  await routeHandler();
});

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert(
    "Error: " +
      errorMsg +
      " Script: " +
      url +
      " Line: " +
      lineNumber +
      " Column: " +
      column +
      " StackTrace: " +
      errorObj
  );
};

async function routeHandler() {
  const router = new Navigo("/", { hash: true });

  window.router = router;

  router
    .hooks({
      before(done, match) {
        setActiveLink("menu", match.url);
        done();
      },
    })
    .on({
      //For very simple "templates", you can just insert your HTML directly like below
      "/": () => {
        document.getElementById("content").innerHTML = `<h2>Home</h2>
        <p style='margin-top:2em'>
        This is the content of the Home Route <br/>
        Observe that this is so simple that all HTML is added in the on-handler for the route. 
        </p>
       `;
      },
      "/login": () => {
        renderTemplate(templates.templateLogin, "content");
        initLogin();
      },
      //"/test": () => renderTemplate(templates.templateTest, "content")
    });
  await roleHandler();
  router
    .notFound(() => {
      renderTemplate(templates.templateNotFound, "content");
    })
    .resolve();
}

export async function roleHandler() {
  if (localStorage.getItem("roles")) {
    //Everything anyone but the ANONYMOUS can access.

    //Removes sign in, since user has already logged in.
    document.getElementById("signIn-id").style.display = "none";
    window.router.off("/signin");

    //Removes login, since role was found.
    document.getElementById("login-id").style.display = "none";
    window.router.off("/login");

    //Shows logout, since role was found.
    document.getElementById("logout-id").style.display = "block";
    window.router.on({
      "/logout": () => {
        renderTemplate(templates.templateLogin, "content");
        logout();
      },
    });

    //Implementér funktionalitet hvor login bliver fjernet hvis der er en rolle, siden at den er null hvis det er anonymous.

    //Der skal også være de gældende "routes", hvor ADMIN som eksempel ikke kan se ting, som en almindelig user kan og vice versa.

    if (localStorage.getItem("roles") == "USER") {
      //Everything where USER can access.

      //Removes Sign-in
      window.router.off("/signIn");

      //Adds order
      window.router.on({
        "/order": () => {
          renderTemplate(templates.templateOrder, "content");
          initOrder(); //<-- Remember to run your innit JS after the template render.
        },
      });

      document.getElementById("menu-id").style.display = "block";
      window.router.on({
        "/menu": () => {
          renderTemplate(templates.templateMenu, "content");
          initMenu();
        },
      });

      //Adds chatGPT
      document.getElementById("chatGpt-id").style.display = "block"; //ONLY IF THE ELEMENT EXISTS ON THE HEADER
      window.router.on({
        "/chatGpt": () => {
          renderTemplate(templates.templateChatGpt, "content");
          innitChatGpt(); //<-- Remember to run your innit JS after the template render.
        },
      });

      //Removes recepter
      document.getElementById("recepter-id").style.display = "none";
      window.router.off("/recepter");

      //Removes add pizza
      document.getElementById("addPizza-id").style.display = "none"; //ONLY IF THE ELEMENT EXISTS ON THE HEADER
      window.router.off("/addPizza");

      //Adds about us
      document.getElementById("about-id").style.display = "block";
      window.router.on({
        "/about": () => renderTemplate(templates.templateAbout, "content"),
      });
    } else if (localStorage.getItem("roles") == "ADMIN") {
      /*
            
            //Everything where ADMIN can access. If you want to add a route for ADMIN, do it here;

            //EXAMPLE: TO ADD A ROUTE
          
              document.getElementById("example-id").style.display = "block" //ONLY IF THE ELEMENT EXISTS ON THE HEADER
              window.router.on({
                "/example": () => {
                renderTemplate(templates.templateExample, "content")
                innitExample() //<-- Remember to run your innit JS after the template render.
                }
              })
              
            //EXAMPLE: TO REMOVE A ROUTE

            document.getElementById("example-id").style.display = "none" //ONLY IF THE ELEMENT EXISTS ON THE HEADER
            window.router.off("/example")

            */

      //Adds Add Pizza
      document.getElementById("addPizza-id").style.display = "block"; //ONLY IF THE ELEMENT EXISTS ON THE HEADER
      window.router.on({
        "/addPizza": () => {
          renderTemplate(templates.templateAddPizzas, "content");
          initAddPizza(); //<-- Remember to run your innit JS after the template render.
        },
      });

      document.getElementById("ingredients-id").style.display = "block";
      window.router.on({
        "/ingredients": () => {
          renderTemplate(templates.templateIngredient, "content");
          initIngredients();
        },
      });

      document.getElementById("pizza-management-id").style.display = "block";
      window.router.on({
        "/pizzaBehandling": () => {
          renderTemplate(templates.templatePizzaManagement, "content");
          initPizzaManagement();
        },
      });

      //Removes chatGpt ordering
      document.getElementById("chatGpt-id").style.display = "none"; //ONLY IF THE ELEMENT EXISTS ON THE HEADER
      window.router.off("/chatGpt");

      //Adds all orders
      document.getElementById("all-orders-id").style.display = "block"; //ONLY IF THE ELEMENT EXISTS ON THE HEADER
      window.router.on({
        "/all-orders": () => {
          renderTemplate(templates.templateAllOrders, "content");
          innitAllOrders();
        },
      });

      document.getElementById("unconfirmed-orders-id").style.display = "block"; //ONLY IF THE ELEMENT EXISTS ON THE HEADER
      window.router.on({
        "/unconfirmed-orders": () => {
          renderTemplate(templates.templateUnconfirmedOrders, "content");
          innitUnconfirmedOrders();
        },
      });

      window.router.on({
        "/orderReceiptChef": () => {
          renderTemplate(templates.templateOrderReceiptChef, "content");
          innitOrderReceiptChef();
        },
      });

      //Removes recepter
      document.getElementById("recepter-id").style.display = "none";
      window.router.off("/recepter");

      //Removes Sign-in
      window.router.off("/signIn");

      //Removes Order
      window.router.off("/order");

      //Removes test
      document.getElementById("about-id").style.display = "none";
      window.router.off("/about");

      //Removes Menu
      document.getElementById("menu-id").style.display = "none";
      window.router.off("/menu");

      //Removes Receipts
    }
  } else {
    //If no role is found, the user is anonymous.

    //Everything where ANONYMOUS can access.

    //So the login is shown, and logout is removed.
    document.getElementById("logout-id").style.display = "none";
    window.router.off("/logout");

    //Adds order
    window.router.on({
      "/order": () => {
        renderTemplate(templates.templateOrder, "content");
        initOrder(); //<-- Remember to run your innit JS after the template render.
      },
    });

    document.getElementById("ingredients-id").style.display = "none";
    window.router.off("/ingredients");
    
    document.getElementById("pizza-management-id").style.display = "none";
    window.router.off("/pizzaBehandling");

    //Removes add pizza
    document.getElementById("addPizza-id").style.display = "none"; //ONLY IF THE ELEMENT EXISTS ON THE HEADER
    window.router.off("/addPizza");

    //Removes recepter
    document.getElementById("recepter-id").style.display = "none";
    window.router.off("/recepter");

    //Removes chatGpt ordering
    document.getElementById("chatGpt-id").style.display = "none"; //ONLY IF THE ELEMENT EXISTS ON THE HEADER
    window.router.off("/chatGpt");

    //Adds back login, since now the user is ANONYMOUS
    document.getElementById("login-id").style.display = "block";
    window.router.on({
      "/login": () => {
        renderTemplate(templates.templateLogin, "content");
        initLogin();
      },
    });

    window.router.on({
      "/signIn": () => {
        renderTemplate(templates.templateSignIn, "content");
        initSignIn();
      },
    });

    //Adds Menu
    document.getElementById("menu-id").style.display = "block";
    window.router.on({
      "/menu": () => {
        renderTemplate(templates.templateMenu, "content");
        initMenu();
      },
    });

    //Adds about us
    document.getElementById("about-id").style.display = "block";
    window.router.on({
      "/about": () => renderTemplate(templates.templateAbout, "content"),
    });

    /*
          //Adds Recepter (commented because I have no idea where to put it, not described.)
          document.getElementById("recepter-id").style.display = "block"
          window.router.on({
            "/recepter": () => {
              renderTemplate(templates.templateRecept, "content")
              initReceipts()
            }})
            */

    //Removing unconfirmed orders page
    document.getElementById("unconfirmed-orders-id").style.display = "none"; //ONLY IF THE ELEMENT EXISTS ON THE HEADER
    window.router.off("/unconfirmed-orders");

    //Removing all orders page
    document.getElementById("all-orders-id").style.display = "none"; //ONLY IF THE ELEMENT EXISTS ON THE HEADER
    window.router.off("/all-orders");

    //Removing orderReceiptChef (confirmed orders)
    window.router.off("/orderReceiptChef");
  }
}
