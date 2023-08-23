window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("I_main").style.paddingLeft = 0;
    document.getElementById("I_footer").innerHTML = "&copy; cplusplus.com, since 2000";
    Array.from(document.querySelector("#I_logo > a").children).forEach(e => {
        document.getElementById("I_logo").appendChild(e);
    });
    Object.assign(document.getElementById("I_header").style, {
        display: "block",
        textAlign: "center"
    });
    Array.from(document.querySelectorAll(".bsa_fixed-leaderboard, .C_bn, #I_left, #I_navsch, #I_user, #I_bar, #I_logo > a")).forEach(e => e.remove());
    document.title = document.querySelector("#I_content h1").innerText + " - cplusplus.com";
});