/**
 * FSRS (Free Spaced Repetition Scheduler) Tests
 *
 * Tests the FSRS algorithm implementation including:
 * - Scheduling with different ratings
 * - Card state transitions (new -> learning -> review)
 * - Difficulty adjustments
 * - Due card detection
 * - Retention calculation
 * - Card statistics
 *
 * Test Coverage Target: >80%
 */

import {
  createNewCard,
  scheduleReview,
  getDueCards,
  calculateInterval,
  calculateRetention,
  getCardStatistics,
  type FSRSCard,
  type Rating,
} from "../fsrs";

describe("FSRS Algorithm", () => {
  describe("createNewCard", () => {
    it("should create a card with default values", () => {
      const card = createNewCard();

      expect(card.difficulty).toBe(0.5);
      expect(card.stability).toBe(0);
      expect(card.lastReview).toBeNull();
      expect(card.nextReview).toBeNull();
      expect(card.state).toBe("new");
      expect(card.reviewCount).toBe(0);
    });

    it("should create independent cards", () => {
      const card1 = createNewCard();
      const card2 = createNewCard();

      card1.difficulty = 0.8;
      expect(card2.difficulty).toBe(0.5);
    });
  });

  describe("scheduleReview - Rating Effects", () => {
    it("should schedule with Again (1) - shortest interval", () => {
      const card = createNewCard();
      const updated = scheduleReview(card, 1);

      expect(updated.state).toBe("learning");
      expect(updated.stability).toBe(0.4); // w[0]
      expect(updated.difficulty).toBeGreaterThan(card.difficulty);
      expect(updated.reviewCount).toBe(1);
      expect(updated.lastReview).toBeInstanceOf(Date);
      expect(updated.nextReview).toBeInstanceOf(Date);
    });

    it("should schedule with Hard (2)", () => {
      const card = createNewCard();
      const updated = scheduleReview(card, 2);

      expect(updated.state).toBe("learning");
      expect(updated.stability).toBe(0.6); // w[1]
      expect(updated.reviewCount).toBe(1);
    });

    it("should schedule with Good (3)", () => {
      const card = createNewCard();
      const updated = scheduleReview(card, 3);

      expect(updated.state).toBe("learning");
      expect(updated.stability).toBe(2.4); // w[2]
      expect(updated.reviewCount).toBe(1);
    });

    it("should schedule with Easy (4) - graduates immediately to review", () => {
      const card = createNewCard();
      const updated = scheduleReview(card, 4);

      expect(updated.state).toBe("review");
      expect(updated.stability).toBe(5.8); // w[3]
      expect(updated.reviewCount).toBe(1);
    });

    it("should increase nextReview interval for higher ratings", () => {
      const card = createNewCard();

      const again = scheduleReview(card, 1);
      const hard = scheduleReview(card, 2);
      const good = scheduleReview(card, 3);
      const easy = scheduleReview(card, 4);

      // Stability should increase with higher ratings
      expect(again.stability).toBeLessThan(hard.stability);
      expect(hard.stability).toBeLessThan(good.stability);
      expect(good.stability).toBeLessThan(easy.stability);
    });
  });

  describe("Card State Transitions", () => {
    it("should transition new -> learning on Again", () => {
      const card = createNewCard();
      const updated = scheduleReview(card, 1);

      expect(updated.state).toBe("learning");
    });

    it("should transition new -> learning on Hard", () => {
      const card = createNewCard();
      const updated = scheduleReview(card, 2);

      expect(updated.state).toBe("learning");
    });

    it("should transition new -> learning on Good", () => {
      const card = createNewCard();
      const updated = scheduleReview(card, 3);

      expect(updated.state).toBe("learning");
    });

    it("should transition new -> review on Easy", () => {
      const card = createNewCard();
      const updated = scheduleReview(card, 4);

      expect(updated.state).toBe("review");
    });

    it("should transition learning -> review when stability exceeds graduating interval", () => {
      const card = createNewCard();

      // First review: new -> learning with Good (stability = 2.4)
      const learning = scheduleReview(card, 3);
      expect(learning.state).toBe("learning");

      // Second review: learning -> review if stability >= 1 day
      const review = scheduleReview(learning, 3);
      expect(review.state).toBe("review");
    });

    it("should transition review -> relearning on Again", () => {
      // Create a card already in review state
      const reviewCard: FSRSCard = {
        difficulty: 0.5,
        stability: 5,
        lastReview: new Date(Date.now() - 86400000 * 5),
        nextReview: new Date(),
        state: "review",
        reviewCount: 5,
      };

      const updated = scheduleReview(reviewCard, 1);
      expect(updated.state).toBe("relearning");
    });

    it("should keep card in review state on successful review", () => {
      const reviewCard: FSRSCard = {
        difficulty: 0.5,
        stability: 5,
        lastReview: new Date(Date.now() - 86400000 * 5),
        nextReview: new Date(),
        state: "review",
        reviewCount: 5,
      };

      const updated = scheduleReview(reviewCard, 3);
      expect(updated.state).toBe("review");
    });
  });

  describe("Difficulty Adjustments", () => {
    it("should increase difficulty on Again (1)", () => {
      const card = createNewCard();
      const updated = scheduleReview(card, 1);

      expect(updated.difficulty).toBe(0.7); // 0.5 + 0.2
    });

    it("should increase difficulty on Hard (2)", () => {
      const card = createNewCard();
      const updated = scheduleReview(card, 2);

      // rating - 3 = -1, delta = -1 * 0.15 = -0.15, new = 0.5 - (-0.15) = 0.65
      expect(updated.difficulty).toBeCloseTo(0.65);
    });

    it("should not change difficulty on Good (3)", () => {
      const card = createNewCard();
      const updated = scheduleReview(card, 3);

      // rating - 3 = 0, delta = 0, no change
      expect(updated.difficulty).toBeCloseTo(0.5);
    });

    it("should decrease difficulty on Easy (4)", () => {
      const card = createNewCard();
      const updated = scheduleReview(card, 4);

      // rating - 3 = 1, delta = 1 * 0.15 = 0.15, new = 0.5 - 0.15 = 0.35
      expect(updated.difficulty).toBeCloseTo(0.35);
    });

    it("should clamp difficulty to max 1.0", () => {
      const card: FSRSCard = {
        ...createNewCard(),
        difficulty: 0.95,
      };
      const updated = scheduleReview(card, 1);

      expect(updated.difficulty).toBeLessThanOrEqual(1);
    });

    it("should clamp difficulty to min 0.1", () => {
      const card: FSRSCard = {
        ...createNewCard(),
        difficulty: 0.15,
      };
      const updated = scheduleReview(card, 4);

      expect(updated.difficulty).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe("getDueCards", () => {
    it("should return new cards as due", () => {
      const cards = [createNewCard(), createNewCard()];
      const due = getDueCards(cards);

      expect(due.length).toBe(2);
    });

    it("should return cards with past nextReview as due", () => {
      const pastCard: FSRSCard = {
        difficulty: 0.5,
        stability: 1,
        lastReview: new Date(Date.now() - 86400000 * 2),
        nextReview: new Date(Date.now() - 86400000),
        state: "review",
        reviewCount: 3,
      };

      const due = getDueCards([pastCard]);
      expect(due.length).toBe(1);
    });

    it("should not return cards with future nextReview", () => {
      const futureCard: FSRSCard = {
        difficulty: 0.5,
        stability: 5,
        lastReview: new Date(),
        nextReview: new Date(Date.now() + 86400000 * 5),
        state: "review",
        reviewCount: 3,
      };

      const due = getDueCards([futureCard]);
      expect(due.length).toBe(0);
    });

    it("should return cards with null nextReview as due", () => {
      const noScheduleCard: FSRSCard = {
        difficulty: 0.5,
        stability: 1,
        lastReview: new Date(),
        nextReview: null,
        state: "learning",
        reviewCount: 1,
      };

      const due = getDueCards([noScheduleCard]);
      expect(due.length).toBe(1);
    });

    it("should sort new cards first", () => {
      const reviewCard: FSRSCard = {
        difficulty: 0.5,
        stability: 1,
        lastReview: new Date(Date.now() - 86400000 * 2),
        nextReview: new Date(Date.now() - 86400000),
        state: "review",
        reviewCount: 3,
      };
      const newCard = createNewCard();

      const due = getDueCards([reviewCard, newCard]);

      expect(due[0].state).toBe("new");
      expect(due[1].state).toBe("review");
    });
  });

  describe("calculateInterval", () => {
    it("should return positive interval", () => {
      const interval = calculateInterval(5);
      expect(interval).toBeGreaterThan(0);
    });

    it("should return minimum of 0.1 days", () => {
      const interval = calculateInterval(0);
      expect(interval).toBeGreaterThanOrEqual(0.1);
    });

    it("should scale with stability", () => {
      // Run multiple times to average out randomness
      let smallSum = 0;
      let largeSum = 0;
      const runs = 100;

      for (let i = 0; i < runs; i++) {
        smallSum += calculateInterval(1);
        largeSum += calculateInterval(10);
      }

      expect(largeSum / runs).toBeGreaterThan(smallSum / runs);
    });
  });

  describe("calculateRetention", () => {
    it("should return 0 for new cards", () => {
      const card = createNewCard();
      expect(calculateRetention(card)).toBe(0);
    });

    it("should return 0 for cards without review dates", () => {
      const card: FSRSCard = {
        ...createNewCard(),
        state: "learning",
        lastReview: null,
        nextReview: null,
      };
      expect(calculateRetention(card)).toBe(0);
    });

    it("should return value between 0 and 1 for reviewed cards", () => {
      const card: FSRSCard = {
        difficulty: 0.5,
        stability: 5,
        lastReview: new Date(Date.now() - 86400000),
        nextReview: new Date(Date.now() + 86400000 * 4),
        state: "review",
        reviewCount: 3,
      };

      const retention = calculateRetention(card);
      expect(retention).toBeGreaterThan(0);
      expect(retention).toBeLessThanOrEqual(1);
    });
  });

  describe("getCardStatistics", () => {
    it("should count cards by state", () => {
      const cards: FSRSCard[] = [
        createNewCard(),
        createNewCard(),
        {
          ...createNewCard(),
          state: "learning",
          lastReview: new Date(),
          nextReview: new Date(),
          reviewCount: 1,
        },
        {
          ...createNewCard(),
          state: "review",
          stability: 5,
          lastReview: new Date(),
          nextReview: new Date(Date.now() + 86400000 * 5),
          reviewCount: 5,
        },
      ];

      const stats = getCardStatistics(cards);

      expect(stats.total).toBe(4);
      expect(stats.new).toBe(2);
      expect(stats.learning).toBe(1);
      expect(stats.review).toBe(1);
      expect(stats.relearning).toBe(0);
    });

    it("should count due cards", () => {
      const cards: FSRSCard[] = [
        createNewCard(), // due (new)
        {
          ...createNewCard(),
          state: "review",
          stability: 5,
          lastReview: new Date(),
          nextReview: new Date(Date.now() + 86400000 * 5), // not due
          reviewCount: 5,
        },
      ];

      const stats = getCardStatistics(cards);
      expect(stats.due).toBe(1);
    });

    it("should calculate average difficulty for reviewed cards", () => {
      const cards: FSRSCard[] = [
        {
          ...createNewCard(),
          state: "review",
          difficulty: 0.3,
          stability: 5,
          lastReview: new Date(),
          nextReview: new Date(Date.now() + 86400000),
          reviewCount: 3,
        },
        {
          ...createNewCard(),
          state: "review",
          difficulty: 0.7,
          stability: 3,
          lastReview: new Date(),
          nextReview: new Date(Date.now() + 86400000),
          reviewCount: 2,
        },
      ];

      const stats = getCardStatistics(cards);
      expect(stats.avgDifficulty).toBeCloseTo(0.5);
    });

    it("should return zero averages when no reviewed cards exist", () => {
      const cards = [createNewCard(), createNewCard()];
      const stats = getCardStatistics(cards);

      expect(stats.avgDifficulty).toBe(0);
      expect(stats.avgStability).toBe(0);
    });
  });

  describe("Full Review Cycle", () => {
    it("should progress a card from new through learning to review", () => {
      let card = createNewCard();
      expect(card.state).toBe("new");

      // First review with Good
      card = scheduleReview(card, 3);
      expect(card.state).toBe("learning");
      expect(card.reviewCount).toBe(1);

      // Second review with Good - should graduate
      card = scheduleReview(card, 3);
      expect(card.state).toBe("review");
      expect(card.reviewCount).toBe(2);

      // Third review with Good - stays in review
      card = scheduleReview(card, 3);
      expect(card.state).toBe("review");
      expect(card.reviewCount).toBe(3);
      expect(card.stability).toBeGreaterThan(2.4);
    });

    it("should handle lapse and recovery", () => {
      // Start with a review card
      let card: FSRSCard = {
        difficulty: 0.5,
        stability: 10,
        lastReview: new Date(Date.now() - 86400000 * 10),
        nextReview: new Date(),
        state: "review",
        reviewCount: 10,
      };

      // Lapse: forgot the card
      card = scheduleReview(card, 1);
      expect(card.state).toBe("relearning");
      expect(card.difficulty).toBeGreaterThan(0.5);

      // Recover with Good
      card = scheduleReview(card, 3);
      // Should be back in review if stability >= 1
      expect(card.state).toBe("review");
    });
  });
});
