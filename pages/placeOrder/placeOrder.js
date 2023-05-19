function saveUserInformation(event) {
    event.preventDefault();

    // Retrieve user input values
    var name = document.getElementById('name').value;
    var surname = document.getElementById('surname').value;
    var phone = document.getElementById('phone').value;
    var address = document.getElementById('address').value;
    var payment = document.getElementById('payment').value;

    // Save user information to a variable, send it to a server, or perform any other desired action
    var userInformation = {
        name: name,
        surname: surname,
        phone: phone,
        address: address,
        payment: payment
    };

    // Display the user information (for demonstration purposes)
    console.log(userInformation);

    // You can redirect the user to another page or display a confirmation message here
}
