insert into soundscape_aggregation_types (
  soundscape_aggregation_type_id,
  identifier,
  name,
  scale,
  description
) values (
  1,
  'time_of_day',
  'Hour of the day',
  '["00:00", "01:00", "......", "22:00", "23:00"]',
  'Aggregates the data by each hour of the day'
), (
  2,
  'day_of_month',
  'Day of the month',
  '["1", "2", "......", "30", "31"]',
  'Aggregates the data by each day of the month'
), (
  3,
  'day_of_year',
  'Day of the year',
  '["1", "2", "......", "365", "366"]',
  'Aggregates the data by each day of the year'
), (
  4,
  'month_in_year',
  'Month of the year',
  '["Jan", "Feb", "......", "Nov", "Dec"]',
  'Aggregates the data by each month of the year'
), (
  5,
  'day_of_week',
  'Day of the week',
  '["Sun", "Mon", "......", "Fri", "Sat"]',
  'Aggregates the data by each day of the week'
), (
  6,
  'year',
  'Year by year',
  '["2010", "2011", "......", "2016", "2017"]',
  'Aggregates the data by each year'
);
