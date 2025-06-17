// script.js
console.log("HALLELUJAH");
function closePopup() {
  document.getElementById('welcome-popup').style.display = 'none';
}

function revealOnScroll() {
  const animates = document.querySelectorAll('.animate');
  const windowHeight = window.innerHeight;

  animates.forEach(el => {
    const position = el.getBoundingClientRect().top;
    if (position < windowHeight - 100) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const popup = document.getElementById('welcome-popup');
    if (popup) popup.classList.add('visible');
  }, 500);
  revealOnScroll();
});

