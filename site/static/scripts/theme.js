function lightScheme() {
  // change the tags
  document.documentElement.style.setProperty("--background", "#FFFFFF");
  document.documentElement.style.setProperty("--primary-colour", "#701adb");
  document.documentElement.style.setProperty("--font-colour", "#000000");
  document.documentElement.style.setProperty("--tag-background", "#f1f1f1");
  document.getElementById("theme-toggle").src = "/static/icons/theme-toggle-purple-dark.svg";
}

function darkScheme() {
  document.documentElement.style.setProperty("--background", "#121212");
  document.documentElement.style.setProperty("--primary-colour", "#BB86FC");
  document.documentElement.style.setProperty("--font-colour", "#ffffff");
  document.documentElement.style.setProperty("--tag-background", "#1f1f1f");
  document.getElementById("theme-toggle").src = "/static/icons/theme-toggle-purple.svg";
}

// store user toggle preference in local storage. Site must remember what theme was last used
// and apply it when the user returns to the site.

function ThemeSwitch() {
  // on click of button with class toggle-theme, store theme in local and switch
  var theme = localStorage.getItem("theme");
  if (theme === "light") {
    localStorage.setItem("theme", "dark");
    darkScheme();
  } else {
    localStorage.setItem("theme", "light");
    lightScheme();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.onload = function () {
    const toggle = document.getElementById("theme-toggle");
    toggle.onclick = function () {
      ThemeSwitch();
    };
  };
});

// check local storage for theme
const theme = localStorage.getItem("theme");
if (theme === "light") {
  lightScheme();
} else {
  darkScheme();
}
