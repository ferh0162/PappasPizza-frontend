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

export function initSignUp(){
    document.getElementById("btn-signUp").onclick = () => signUp(getUserDetails())

}

function getUserDetails(){
    const user = {}

    user.firstname = document.getElementById()
}

function signUp(user){

}