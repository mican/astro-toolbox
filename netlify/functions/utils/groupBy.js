module.exports = function groupBy(array, key) {
  const groups = array.reduce(
    (groups, item) => ({
      ...groups,
      [item[key]]: [...(groups[item[key]] || []), item],
    }),
    {},
  );

  return Object.values(groups);
};
