function switchTheme(e) {
  if (currentTheme == "light") {
    currentTheme = "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
  } else {
    currentTheme = "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
  }
}

const toggleSwitch = document.getElementById("theme-toggle-button");
toggleSwitch.addEventListener("click", switchTheme);

let currentTheme = localStorage.getItem("theme");
if (currentTheme !== null) {
  document.documentElement.setAttribute("data-theme", currentTheme);
}
