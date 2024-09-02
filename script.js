function showAddMovieModal() {
    document.getElementById('addMovieModal').style.display = 'block';
}

function closeAddMovieModal() {
    document.getElementById('addMovieModal').style.display = 'none';
}

function login() {
    window.location.href = "/login";
}

function addMovie() {
    const title = document.getElementById('movieTitle').value;
    const imageFile = document.getElementById('movieImage').files[0];

    if (title && imageFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const ul = document.getElementById('movieList');
            const li = document.createElement('li');

            li.innerHTML = `
                <input type="checkbox" class="delete-checkbox">
                <img src="${event.target.result}" alt="${title} 포스터" style="width: 200px;"><br>
                <a href="#" target="_blank">${title}</a>
            `;

            ul.appendChild(li);
            closeAddMovieModal();
        }
        reader.readAsDataURL(imageFile);
    } else {
        alert("모든 필드를 입력해 주세요.");
    }
}

function deleteSelected() {
    const checkboxes = document.querySelectorAll('.delete-checkbox');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.parentElement.remove();
        }
    });
}