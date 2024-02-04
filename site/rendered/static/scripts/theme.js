function lightScheme() {
  // change the tags
  document.documentElement.style.setProperty("--background", "#f9f1cb");
  document.documentElement.style.setProperty("--primary-colour", "#ac792e");
  document.documentElement.style.setProperty("--font-colour", "#282828");
  document.documentElement.style.setProperty("--tag-background", "#eee2be");
  document.getElementById("theme-toggle").src="/static/icons/light-toggle.svg";
}

function darkScheme() {
  document.documentElement.style.setProperty("--background", "#1e2021");
  document.documentElement.style.setProperty("--primary-colour", "#f0bf4f");
  document.documentElement.style.setProperty("--font-colour", "#f9f1cb");
  document.documentElement.style.setProperty("--tag-background", "#3b3836");
  document.getElementById("theme-toggle").src="/static/icons/dark-toggle.svg";
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
