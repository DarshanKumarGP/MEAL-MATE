import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { theme } from '../../styles/theme';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../../context/ToastContext';

interface Review {
  id: number;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
  };
  rating: number;
  comment: string;
  food_rating: number;
  delivery_rating: number;
  created_at: string;
  is_approved: boolean;
}

interface ReviewSystemProps {
  restaurantId: number;
  canReview?: boolean;
  orderId?: number;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({ restaurantId, canReview = false, orderId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/orders/reviews/?restaurant=${restaurantId}`);
      setReviews(data.results || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!comment.trim()) {
      addToast('Please write a comment', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/orders/reviews/', {
        restaurant: restaurantId,
        order: orderId,
        rating,
        food_rating: foodRating,
        delivery_rating: deliveryRating,
        comment: comment.trim()
      });
      
      addToast('Review submitted successfully!', 'success');
      setShowReviewForm(false);
      setComment('');
      setRating(5);
      setFoodRating(5);
      setDeliveryRating(5);
      fetchReviews();
    } catch (error: any) {
      addToast(error.response?.data?.detail || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating: React.FC<{ 
    rating: number; 
    onChange?: (rating: number) => void; 
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }> = ({ rating, onChange, readonly = false, size = 'md' }) => {
    const sizes = { sm: 14, md: 18, lg: 24 };
    const fontSize = sizes[size];

    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={readonly ? undefined : () => onChange?.(star)}
            style={{
              fontSize: `${fontSize}px`,
              color: star <= rating ? '#FFD700' : '#E5E5E5',
              cursor: readonly ? 'default' : 'pointer',
              transition: 'color 0.2s'
            }}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0
  }));

  if (loading) {
    return (
      <Card>
        <div style={{ padding: theme.spacing.lg, textAlign: 'center' }}>
          Loading reviews...
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Review Summary */}
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <h3 style={{
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.semibold,
          margin: `0 0 ${theme.spacing.lg} 0`,
          color: theme.colors.gray[900]
        }}>
          Customer Reviews ({reviews.length})
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: theme.spacing.lg,
          alignItems: 'center'
        }}>
          {/* Average Rating */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.primary.main
            }}>
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} readonly size="lg" />
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[600],
              marginTop: theme.spacing.xs
            }}>
              {reviews.length} reviews
            </div>
          </div>

          {/* Rating Distribution */}
          <div style={{ flex: 1 }}>
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.xs
              }}>
                <span style={{ fontSize: theme.typography.fontSize.sm, width: '10px' }}>
                  {rating}
                </span>
                <span style={{ fontSize: '12px' }}>⭐</span>
                <div style={{
                  flex: 1,
                  height: '8px',
                  backgroundColor: theme.colors.gray[200],
                  borderRadius: theme.borderRadius.sm,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: theme.colors.primary.main,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.gray[500],
                  minWidth: '30px'
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>

          {/* Write Review Button */}
          {canReview && (
            <div>
              <Button onClick={() => setShowReviewForm(true)}>
                ✍️ Write Review
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <h4 style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.medium,
            margin: `0 0 ${theme.spacing.lg} 0`
          }}>
            Write a Review
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: theme.spacing.lg,
            marginBottom: theme.spacing.lg
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.sm,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium
              }}>
                Overall Rating
              </label>
              <StarRating rating={rating} onChange={setRating} size="lg" />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.sm,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium
              }}>
                Food Quality
              </label>
              <StarRating rating={foodRating} onChange={setFoodRating} size="lg" />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.sm,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium
              }}>
                Delivery Experience
              </label>
              <StarRating rating={deliveryRating} onChange={setDeliveryRating} size="lg" />
            </div>
          </div>

          <textarea
            placeholder="Share your experience with other customers..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: theme.spacing.md,
              border: `2px solid ${theme.colors.gray[200]}`,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              resize: 'vertical',
              outline: 'none',
              marginBottom: theme.spacing.md
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.primary.main}
            onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.gray[200]}
          />

          <div style={{ display: 'flex', gap: theme.spacing.md, justifyContent: 'flex-end' }}>
            <Button
              variant="ghost"
              onClick={() => setShowReviewForm(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              disabled={submitting}
              isLoading={submitting}
            >
              Submit Review
            </Button>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        {reviews.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: theme.spacing.xl }}>
            <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>💬</div>
            <h4 style={{ color: theme.colors.gray[600], margin: 0 }}>
              No reviews yet
            </h4>
            <p style={{ color: theme.colors.gray[500], margin: `${theme.spacing.sm} 0 0 0` }}>
              Be the first to share your experience!
            </p>
          </Card>
        ) : (
          reviews.map(review => (
            <Card key={review.id}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: theme.spacing.sm
              }}>
                <div>
                  <div style={{
                    fontWeight: theme.typography.fontWeight.medium,
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.gray[900]
                  }}>
                    {review.customer.first_name} {review.customer.last_name}
                  </div>
                  <div style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.gray[500]
                  }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
                <StarRating rating={review.rating} readonly />
              </div>

              <p style={{
                color: theme.colors.gray[700],
                fontSize: theme.typography.fontSize.sm,
                lineHeight: 1.5,
                margin: `0 0 ${theme.spacing.md} 0`
              }}>
                {review.comment}
              </p>

              <div style={{
                display: 'flex',
                gap: theme.spacing.lg,
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.gray[500]
              }}>
                <span>🍽️ Food: <StarRating rating={review.food_rating} readonly size="sm" /></span>
                <span>🚚 Delivery: <StarRating rating={review.delivery_rating} readonly size="sm" /></span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;
