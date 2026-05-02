document.addEventListener('DOMContentLoaded', function () {
    const headers = document.querySelectorAll("div.ce-header");
    if (headers.length > 0) {
        headers.forEach(function (header) {
            header.onclick = function () {
                this.style.background = 'blue';
            };
        });
    }
});
