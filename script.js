
const loginBox = document.getElementById('login-box');
const signupBox = document.getElementById('signup-box');
const msgBox = document.getElementById('msg');
const toSignupBtn = document.getElementById('to-signup');
const toLoginBtn = document.getElementById('to-login');


function toggleForms() {
    loginBox.classList.toggle('hidden');
    signupBox.classList.toggle('hidden');
    clearMessage();
}


function showMessage(text, isSuccess) {
    msgBox.textContent = text;
    msgBox.className = `message ${isSuccess ? 'success' : 'error'}`;
}

function clearMessage() {
    msgBox.className = 'message hidden';
}


toSignupBtn.addEventListener('click', toggleForms);
toLoginBtn.addEventListener('click', toggleForms);


document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

  
    localStorage.setItem(email, JSON.stringify({ name, password }));
    
    showMessage("Account created successfully! Switching to login...", true);
    this.reset();
    
   
    setTimeout(() => {
        toggleForms();
    }, 2000);
});

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

   
    const user = JSON.parse(localStorage.getItem(email));

    if (user && user.password === password) {
        showMessage(`Welcome back, ${user.name}! Login successful.`, true);
    } else {
        showMessage("Invalid email or password. Try again.", false);
    }
});
