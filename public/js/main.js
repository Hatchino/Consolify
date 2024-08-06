//// Afficher password au clique
const togglePassword = document.querySelector('#togglePassword');
if (togglePassword) {
  const password = document.querySelector('#id_password');

  togglePassword.addEventListener('click', function (e) {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
  });
}


// string password validation
let passwordInp = document.querySelector('.password-input');
let passwordChecklist = document.querySelectorAll('.list-item');

let validationRegex = [
    { regex: /.{8,}/ }, // min 8 letters,
    { regex: /[0-9]/ }, // numbers from 0 - 9
    { regex: /[a-z]/ }, // letters from a - z (lowercase)
    { regex: /[A-Z]/}, // letters from A-Z (uppercase),
    { regex: /[^A-Za-z0-9]/} // special characters
]

if (passwordInp) {
passwordInp.addEventListener('keyup', () => {
    validationRegex.forEach((item, i) => {

        let isValid = item.regex.test(passwordInp.value);

        if(isValid) {
            passwordChecklist[i].classList.add('checked');
        } else{
            passwordChecklist[i].classList.remove('checked');
        }

    })
})
}

let form = document.getElementById('form-login');
if (form) {
  form.addEventListener('submit', (event) => {
      let isValid = validationRegex.every((item) => item.regex.test(passwordInp.value));
      if (!isValid) {
          event.preventDefault();
          window.location.href = '/register?error=5';
      }
  });
}



//// Gestion des erreurs forms register & login
const messageErrorDiv = document.getElementById("message-error");
const urlParams = new URLSearchParams(window.location.search);
const errorCode = urlParams.get("error");

if(messageErrorDiv) {
  switch (errorCode) {
    case "1":
        messageErrorDiv.innerHTML = "La confirmation du mot de passe ne correspond pas au mot de passe. Veuillez réessayer.";
        messageErrorDiv.style.display = "block";
        break;
    case "2":
        messageErrorDiv.innerHTML = "Veuillez remplir tous les champs.";
        messageErrorDiv.style.display = "block"; 
        break;
    case "3":
        messageErrorDiv.innerHTML = "Ce pseudo existe déjà. Veuillez en choisir un autre.";
        messageErrorDiv.style.display = "block"; 
        break;
    case "4":
      messageErrorDiv.innerHTML = "Pseudo ou mot de passe incorrect.";
      messageErrorDiv.style.display = "block"; 
    case "5":
      messageErrorDiv.innerHTML = "Veuillez remplir toutes les conditions du mot de passe.";
    break;
    default:
      messageErrorDiv.style.display = "none"; 
      break;
  }
}


//// Bannière si connecté
// document.addEventListener("DOMContentLoaded", function () {
//   var barre = document.getElementById("barre");
//   if (barre) {
//     barre.style.transition = "margin-top 0.5s";
//     barre.style.marginTop = "0";
    
//     var fermer = document.getElementById("fermer");
//     if (fermer) {
//       fermer.addEventListener("mousedown", function () {
//         barre.style.marginTop = "-70px";
//       });
//     }
//   }
// });

//// Dérouler les thèmes
const toggleDiv = document.getElementById("toggleDiv");
const navCategory = document.querySelector(".nav-category");
const icon = document.querySelector(".rotate-icon");

if (toggleDiv) {
  toggleDiv.addEventListener("click", function () {
    if (!navCategory.classList.contains("open")) {
      // Ouvrir la catégorie de navigation
      navCategory.classList.add("open");
      icon.style.transform = "rotate(180deg)";
    } else {
      // Fermer la catégorie de navigation
      navCategory.classList.remove("open");
      icon.style.transform = "rotate(0deg)";
    }
  });
}


//// Dérouler les thèmes
const navFooter = document.querySelector(".toggle-footer");
const toggleFooter = document.getElementById ("footerIcon");
const iconFooter = document.querySelector(".rotate-icon-footer");

if (toggleFooter) {
  toggleFooter.addEventListener("click", function () {
    console.log("click");
    if (!navFooter.classList.contains("open")) {
      // Ouvrir footer
      navFooter.classList.add("open");
      iconFooter.style.transform = "rotate(180deg)";
    } else {
      // Fermer footer
      navFooter.classList.remove("open");
      iconFooter.style.transform = "rotate(0deg)";
    }
  });
}

///// Loader
document.addEventListener("DOMContentLoaded", function () {
  const loader = document.getElementById("loader");
  loader.style.opacity = 0;
  setTimeout(() => {
      loader.style.display = "none";
  }, 500); // 0.5 seconde pour la transition d'opacité
});

//// Retour à la page précédente
const btnBack = document.querySelector(".btn-back");

if (btnBack) {
  btnBack.addEventListener("click", function() {
    window.history.back();
  });
}



