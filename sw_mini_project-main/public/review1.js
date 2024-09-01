document.addEventListener('DOMContentLoaded', function() {
    displayReviews();
});

document.getElementById('review-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const userId = '익명'; // ID 입력 없이 '익명'으로 설정
    const reviewText = document.getElementById('review-input').value;

    if (reviewText) {
        const newReview = {
            id: Date.now(),
            userId: userId,
            text: reviewText,
            timestamp: new Date().toISOString(),
            comments: []
        };

        const reviews = JSON.parse(localStorage.getItem('crime_city_reviews')) || [];
        reviews.push(newReview);
        localStorage.setItem('crime_city_reviews', JSON.stringify(reviews));

        displayReviews();
        document.getElementById('review-input').value = '';
    } else {
        alert('리뷰 내용을 입력해 주세요.');
    }
});

function displayReviews() {
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = '';

    const reviews = JSON.parse(localStorage.getItem('crime_city_reviews')) || [];

    reviews.forEach(review => {
        const reviewItem = document.createElement('li');
        reviewItem.classList.add('review-item');

        const reviewContent = document.createElement('div');
        reviewContent.classList.add('review-content');
        reviewContent.innerHTML = `
            <strong>${review.userId}</strong> <em>${new Date(review.timestamp).toLocaleString()}</em>
            <p>${review.text}</p>
        `;

        const commentForm = document.createElement('form');
        commentForm.classList.add('comment-form');
        commentForm.innerHTML = `
            <textarea placeholder="댓글을 남겨주세요..." required></textarea><br>
            <button type="submit">댓글 달기</button>
        `;

        commentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const commentText = commentForm.querySelector('textarea').value;

            if (commentText) {
                const updatedReviews = reviews.map(r => {
                    if (r.id === review.id) {
                        r.comments.push({
                            id: Date.now(),
                            userId: '익명',
                            text: commentText,
                            timestamp: new Date().toISOString()
                        });
                    }
                    return r;
                });

                localStorage.setItem('crime_city_reviews', JSON.stringify(updatedReviews));
                displayReviews();
            } else {
                alert('댓글 내용을 입력해 주세요.');
            }
        });

        const commentList = document.createElement('ul');
        commentList.classList.add('comment-list');
        review.comments.forEach(comment => {
            const commentItem = document.createElement('li');
            commentItem.innerHTML = `
                <strong>${comment.userId}</strong> <em>${new Date(comment.timestamp).toLocaleString()}</em>
                <p>${comment.text}</p>
            `;
            commentList.appendChild(commentItem);
        });

        reviewItem.appendChild(reviewContent);
        reviewItem.appendChild(commentForm);
        reviewItem.appendChild(commentList);
        reviewList.appendChild(reviewItem);
    });
}

function sortReviews(order) {
    let reviews = JSON.parse(localStorage.getItem('crime_city_reviews')) || [];

    if (order === 'newest') {
        reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (order === 'oldest') {
        reviews.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    localStorage.setItem('crime_city_reviews', JSON.stringify(reviews));
    displayReviews();
}