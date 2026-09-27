import { classifyReview } from './customer-insights.js';

export function analyzeReviews(reviews, criticalRating = 2) {
  return reviews.map(review => ({ ...review, category: classifyReview(review.comment), critical: Number(review.rating) <= criticalRating, action: Number(review.rating) <= criticalRating ? 'REQUER ATENÇÃO' : 'MONITORAR' }));
}

export function criticalReviews(reviews) { return analyzeReviews(reviews).filter(review => review.critical); }
