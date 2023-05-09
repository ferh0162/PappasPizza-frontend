// import navigo
import "https://unpkg.com/navigo"; //Will create the global Navigo object used below
import {
  setActiveLink,
  adjustForMissingHash,
  renderTemplate,
  loadTemplate,
} from "./utils.js";

// js imports
import { initReceipts } from "./pages/recepter/recepter.js";

window.addEventListener("load", async () => {
  const templateReceipts = await loadTemplate("./pages/recepter/recepter.html");

  adjustForMissingHash();

  const router = new Navigo("/", { hash: true });
  //Not especially nice, BUT MEANT to simplify things. Make the router global so it can be accessed from all js-files
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
      "/": () =>
        (document.getElementById("content").innerHTML = ``),
      "/recepter": () => {
        renderTemplate(templateReceipts, "content");
        initReceipts();
      },
    })
    .notFound(() => {
      renderTemplate(templateNotFound, "content"); // <- make this HTML
    })
    .resolve();
});

export function checkRole(role) {
  //look at storage roles, return boolean check. If true, show content, if not, dont
}

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
