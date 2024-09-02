document.addEventListener('DOMContentLoaded', function () {
    displayReviews(); // 페이지 로드 시 리뷰 표시
});

document.getElementById('review-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const reviewText = document.getElementById('review-input').value.trim();
    if (reviewText) {
        const newReview = {
            id: Date.now(),
            text: reviewText,
            timestamp: new Date().toISOString() // 리뷰 작성 시 현재 시간 기록
        };

        // 로컬 스토리지에서 기존 리뷰 불러오기
        let reviews = JSON.parse(localStorage.getItem('movie_reviews')) || [];
        reviews.push(newReview); // 새로운 리뷰 추가
        localStorage.setItem('movie_reviews', JSON.stringify(reviews)); // 로컬 스토리지에 다시 저장

        displayReviews(); // 업데이트된 리뷰 표시
        document.getElementById('review-input').value = ''; // 입력 필드 초기화
    }
});

function displayReviews() {
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = ''; // 기존 리뷰 목록 초기화

    // 로컬 스토리지에서 리뷰 목록 불러오기
    const reviews = JSON.parse(localStorage.getItem('movie_reviews')) || [];

    // 리뷰가 있는 경우만 표시
    if (reviews.length > 0) {
        reviews.forEach(review => {
            const reviewItem = document.createElement('li');
            reviewItem.classList.add('review-item');
            reviewItem.innerHTML = `
                <strong>익명</strong> <em>${new Date(review.timestamp).toLocaleString()}</em>
                <p>${review.text}</p>
            `;
            reviewList.appendChild(reviewItem);
        });
    }
}