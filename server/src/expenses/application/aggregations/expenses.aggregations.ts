/**
 * Expense aggregation pipelines
 * Centralized aggregation logic for database operations
 */

export const getTotalExpensesForMonthPipeline = (
  userIdQuery: any,
  startDate: Date,
  endDate: Date,
) => [
  {
    $match: {
      ...userIdQuery,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    },
  },
  {
    $group: {
      _id: null,
      total: { $sum: '$amount' },
    },
  },
];

export const getTotalExpensesForMonthsPipeline = (
  userIdQuery: any,
  monthRanges: Array<{ month: string; startDate: Date; endDate: Date }>,
) => [
  {
    $match: {
      ...userIdQuery,
      $or: monthRanges.map((range) => ({
        date: {
          $gte: range.startDate,
          $lt: range.endDate,
        },
      })),
    },
  },
  {
    $group: {
      _id: {
        $dateToString: {
          format: '%Y-%m',
          date: '$date',
          timezone: 'UTC',
        },
      },
      total: { $sum: '$amount' },
    },
  },
];

export const getDailySpendingPipeline = (
  userIdQuery: any,
  startDate: Date,
  endDate: Date,
) => [
  {
    $match: {
      ...userIdQuery,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    },
  },
  {
    $addFields: {
      dayOfMonth: { $dayOfMonth: '$date' },
    },
  },
  {
    $group: {
      _id: '$dayOfMonth',
      spending: { $sum: '$amount' },
    },
  },
  {
    $project: {
      _id: 0,
      day: '$_id',
      spending: 1,
    },
  },
  {
    $sort: { day: 1 as const },
  },
];

export const getCategoryBreakdownPipeline = (
  userIdQuery: any,
  startDate: Date,
  endDate: Date,
) => [
  {
    $match: {
      ...userIdQuery,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    },
  },
  {
    $group: {
      _id: { $ifNull: ['$category', 'Uncategorized'] },
      amount: { $sum: '$amount' },
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      category: '$_id',
      amount: 1,
      count: 1,
    },
  },
  {
    $sort: { amount: -1 as const },
  },
];

