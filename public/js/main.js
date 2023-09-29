//// Afficher password au clique
const togglePassword = document.querySelector('#togglePassword');
if (togglePassword) {
  const password = document.querySelector('#id_password');

  togglePassword.addEventListener('click', function (e) {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
  });
}

//// Bannière si connecté
document.addEventListener("DOMContentLoaded", function () {
  var barre = document.getElementById("barre");
  if (barre) {
    barre.style.transition = "margin-top 0.5s";
    barre.style.marginTop = "0";
    
    var fermer = document.getElementById("fermer");
    if (fermer) {
      fermer.addEventListener("mousedown", function () {
        barre.style.marginTop = "-70px";
      });
    }
  }
});

//// Dérouler les thèmes
const toggleDiv = document.getElementById("toggleDiv");
const navCategory = document.querySelector(".nav-category");
const icon = document.querySelector(".rotate-icon");

if (toggleDiv) {
  toggleDiv.addEventListener("click", function () {
      if (navCategory.style.display === "none" || navCategory.style.display === "") {
          // Ouvrir la catégorie de navigation
          navCategory.style.display = "block";
          navCategory.classList.add("open");
          icon.style.transform = "rotate(180deg)";
      } else {
          // Fermer la catégorie de navigation
          navCategory.style.display = "none";
          navCategory.classList.remove("open");
          icon.style.transform = "rotate(0deg)";
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



