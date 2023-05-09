import {handleHttpErrors, sanitizeStringWithTableRows} from "../../utils.js"


export function initReceipts() {

    loadReceipts()


}



async function loadReceipts() {
    const data = await fetch("http://localhost:8080/api/receipts", {})
    .then(handleHttpErrors)
    
    renderReceipts(data)

}


function renderReceipts(receipts) {
    const tableRowsArray = receipts.map(
        (receipt) => `
        <tr>                                
          <td>${receipt.id} </td>              
          <td> username </td>              
        </tr>`
      );
      const tableRowsString = tableRowsArray.join("\n");
      document.getElementById("tbl-body").innerHTML =
        sanitizeStringWithTableRows(tableRowsString);

}


