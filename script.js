document.addEventListener("DOMContentLoaded", () => {
    for (const query of document.querySelectorAll(".typing")) {
        const text = query.getAttribute("data-text").replace(/\;(\s+)?/, ";");
        let index = 0;
        const id = setInterval(() => {
            if (index < text.length) {
                if (text[index] === ";") {
                    query.innerHTML += "<br>";
                }
                else {
                    query.innerHTML += text[index];
                }
                index++;
            }
            else {
                clearInterval(id);
            }
        }, 25);
    }
});

//==========================================//
// import random                            //
// import time                              //
// random.randint(0, 10)                    //
//==========================================//
