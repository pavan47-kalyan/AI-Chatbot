
import { getApiKey } from '../utils/apiKeyManager';
import { toast } from "sonner";

export interface ReviewAnalysis {
  sentiment: {
    score: number;
    label: string;
    description: string;
  };
  keyFeatures: {
    name: string;
    rating: number;
    description: string;
  }[];
  highlights: string[];
  overallRating: number;
  recommendation: string;
  tags: string[];
  comparativeInsights: string[];
  followUpQuestions: {
    id: number;
    question: string;
  }[];
}

// Example review analyses for different types of reviews
const reviewExamples: Record<string, ReviewAnalysis> = {
  positive: {
    sentiment: {
      score: 92,
      label: "Very Positive",
      description: "Strong enthusiasm detected!"
    },
    keyFeatures: [
      { name: "Sound Quality", rating: 5, description: "Outstanding!" },
      { name: "Battery Life", rating: 4, description: "Above Average" },
      { name: "Comfort", rating: 5, description: "Perfect Fit" },
      { name: "Connectivity", rating: 4, description: "Reliable" }
    ],
    highlights: [
      "Absolutely amazing sound quality!",
      "The battery life exceeded my expectations",
      "Most comfortable earbuds I've ever worn"
    ],
    overallRating: 4.5,
    recommendation: "Highly recommended for audiophiles and everyday users alike. The sound quality and comfort make these a top choice.",
    tags: ["#PremiumSound", "#ComfortableWear", "#ReliableBattery"],
    comparativeInsights: [
      "Sound quality rated 25% higher than average",
      "Comfort scores in top 10% of reviews",
      "Battery life meets premium standards"
    ],
    followUpQuestions: [
      { id: 1, question: "Rate the noise cancellation specifically?" },
      { id: 2, question: "Share more about the connectivity?" },
      { id: 3, question: "Compare with other models?" }
    ]
  },
  negative: {
    sentiment: {
      score: 35,
      label: "Negative",
      description: "Significant dissatisfaction detected"
    },
    keyFeatures: [
      { name: "Build Quality", rating: 2, description: "Flimsy Construction" },
      { name: "User Interface", rating: 1, description: "Confusing" },
      { name: "Performance", rating: 2, description: "Slow" },
      { name: "Value", rating: 1, description: "Overpriced" }
    ],
    highlights: [
      "Broke within the first week",
      "The interface is extremely unintuitive",
      "Constantly freezes during basic tasks"
    ],
    overallRating: 1.5,
    recommendation: "Not recommended. There are better alternatives at this price point with better build quality and performance.",
    tags: ["#QualityIssues", "#PoorInterface", "#PerformanceProblems"],
    comparativeInsights: [
      "Build quality rated 40% lower than comparable products",
      "User interface among the least intuitive in category",
      "Performance issues reported at 3x the category average"
    ],
    followUpQuestions: [
      { id: 1, question: "Would you be interested in alternative products?" },
      { id: 2, question: "Did you contact customer support about these issues?" },
      { id: 3, question: "Are there any features you did like about the product?" }
    ]
  },
  mixed: {
    sentiment: {
      score: 65,
      label: "Mixed",
      description: "Both positive and negative elements detected"
    },
    keyFeatures: [
      { name: "Design", rating: 4, description: "Sleek and Modern" },
      { name: "Functionality", rating: 3, description: "Adequate" },
      { name: "Reliability", rating: 2, description: "Inconsistent" },
      { name: "Price", rating: 3, description: "Fair Value" }
    ],
    highlights: [
      "Beautiful design and aesthetics",
      "Works fine most of the time",
      "Some reliability issues after extended use"
    ],
    overallRating: 3,
    recommendation: "Recommended with reservations. Great design but reliability issues might be a concern for heavy users.",
    tags: ["#GreatDesign", "#OccasionalIssues", "#MixedExperience"],
    comparativeInsights: [
      "Design rated in top 15% of category",
      "Reliability issues common across similar products",
      "Value proposition is average for price point"
    ],
    followUpQuestions: [
      { id: 1, question: "How important is reliability vs design to you?" },
      { id: 2, question: "Would you like details on the specific reliability issues?" },
      { id: 3, question: "Are you interested in similar products with better reliability?" }
    ]
  },
  technical: {
    sentiment: {
      score: 80,
      label: "Positive",
      description: "Technical appreciation detected"
    },
    keyFeatures: [
      { name: "Processing Power", rating: 5, description: "Exceptional" },
      { name: "Software Integration", rating: 4, description: "Comprehensive" },
      { name: "Technical Support", rating: 3, description: "Adequate" },
      { name: "Learning Curve", rating: 2, description: "Steep" }
    ],
    highlights: [
      "Powerful processing capabilities for complex tasks",
      "Integrates well with existing software ecosystem",
      "Documentation could be more comprehensive"
    ],
    overallRating: 4,
    recommendation: "Highly recommended for technical users and professionals. May be challenging for beginners.",
    tags: ["#PowerfulTech", "#ProGrade", "#TechnicalExcellence"],
    comparativeInsights: [
      "Processing power exceeds 90% of competitors",
      "Integration capabilities are industry standard",
      "Learning curve steeper than 70% of alternatives"
    ],
    followUpQuestions: [
      { id: 1, question: "Are you using this for professional applications?" },
      { id: 2, question: "Would you like resources to help with the learning curve?" },
      { id: 3, question: "What specific technical aspects are most important to you?" }
    ]
  }
};

/**
 * Analyze a product review and return detailed insights
 */
export const analyzeReview = async (review: string): Promise<ReviewAnalysis> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('API key not found. Please add your API key.');
  }
  
  // In a real implementation, we would send the review to an API
  // For now, we'll use example responses based on the content
  try {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple keyword-based matching for demo purposes
    if (review.toLowerCase().includes('broke') || 
        review.toLowerCase().includes('terrible') || 
        review.toLowerCase().includes('worst')) {
      return reviewExamples.negative;
    } else if (review.toLowerCase().includes('technical') || 
               review.toLowerCase().includes('software') || 
               review.toLowerCase().includes('processing')) {
      return reviewExamples.technical;
    } else if (review.toLowerCase().includes('but') || 
               review.toLowerCase().includes('however') || 
               review.toLowerCase().includes('issue')) {
      return reviewExamples.mixed;
    } else {
      return reviewExamples.positive;
    }
  } catch (error) {
    console.error('Error analyzing review:', error);
    toast.error('Failed to analyze review. Please try again.');
    throw error;
  }
};
