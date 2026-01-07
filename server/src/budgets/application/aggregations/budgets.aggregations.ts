/**
 * Budget aggregation pipelines
 * Centralized aggregation logic for database operations
 */

export const getBudgetWithCalculationsPipeline = () => [
  {
    $addFields: {
      essentialItems: {
        $sortArray: {
          input: { $ifNull: ['$essentialItems', []] },
          sortBy: { amount: -1 },
        },
      },
      totalBudget: {
        $reduce: {
          input: { $ifNull: ['$essentialItems', []] },
          initialValue: 0,
          in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
        },
      },
    },
  },
];

export const getBudgetWithTotalOnlyPipeline = () => [
  {
    $addFields: {
      totalBudget: {
        $reduce: {
          input: { $ifNull: ['$essentialItems', []] },
          initialValue: 0,
          in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
        },
      },
    },
  },
];

export const buildBudgetAggregationPipeline = (
  matchQuery: any,
  includeSorting = true,
) => {
  const pipeline: any[] = [
    { $match: matchQuery },
    ...getBudgetWithCalculationsPipeline(),
  ];

  if (includeSorting) {
    pipeline.push({ $sort: { month: -1 } });
  }

  return pipeline;
};
