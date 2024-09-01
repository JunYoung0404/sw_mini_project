document.getElementById('review-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const reviewInput = document.getElementById('review-input');
    const reviewText = reviewInput.value;

    if (reviewText) {
        const reviewList = document.getElementById('review-list');
        const newReview = document.createElement('li');
        newReview.textContent = reviewText;
        reviewList.appendChild(newReview);

        reviewInput.value = '';  // 입력 필드를 초기화합니다.
    }
});