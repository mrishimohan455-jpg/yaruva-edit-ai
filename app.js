// YARUVA AI STUDIO
// Home page interactions

document.addEventListener("DOMContentLoaded", () => {

  const profileBtn = document.getElementById("profileBtn");
  const bottomProfileBtn =
    document.getElementById("bottomProfileBtn");

  function profileMessage() {
    alert(
      "YARUVA Profile\n\n" +
      "AI Creative Studio\n\n" +
      "Your profile and settings will be available here."
    );
  }

  if (profileBtn) {
    profileBtn.addEventListener("click", profileMessage);
  }

  if (bottomProfileBtn) {
    bottomProfileBtn.addEventListener("click", profileMessage);
  }

});
