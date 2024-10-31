
function switchTheme(e) {
    if (currentTheme == "light") {
        currentTheme = "dark"
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        // toggleSwitch.innerHTML = `dark_mode`
    }
    else {
        currentTheme = "light"
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        // toggleSwitch.innerHTML = `light_mode`
    }
}


const toggleSwitch = document.getElementById("theme-toggle-button");
toggleSwitch.addEventListener('click', switchTheme);

let currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : "light";
document.documentElement.setAttribute('data-theme', currentTheme);

// if (currentTheme == "light") {
//     toggleSwitch.innerHTML = `light_mode`
// } else {
//     toggleSwitch.innerHTML = `dark_mode`
// }