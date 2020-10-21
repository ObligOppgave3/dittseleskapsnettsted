"use strict";
var slideIndex = 1;
showDivs(slideIndex);

function plusDivs(n) {
  showDivs(slideIndex += n);
}

function showDivs(n) {
  /* Skriv kommentarer til koden!  */
  var i;
  var x = document.getElementsByClassName("mySlides");
  if(n > x.length) {slideIndex = 1}
    if (n < 1) {slideIndex = x.length}
      for (i = 0; i < x.length; i++){
        /* Skjuler */
        x[i].style.display = "none";
      }
      x[slideIndex-1].style.display = "block";

}