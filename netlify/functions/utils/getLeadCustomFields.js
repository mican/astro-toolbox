const constants = require("./constants");
const groupBy = require("./groupBy");

module.exports = function getLeadCustomFields(payloadData) {
  const customFields = Object.entries(constants.customFieldKeys).reduce((acc, [name, key]) => {
    const value = payloadData[name];

    if (value && !["null", "undefined"].includes(value.toLowerCase())) {
      if (["serviceType", "services", "technology"].includes(name)) {
        const arrayOfOptions = value
          .split(",")
          .map((curr) => {
            const currKeyOptions = constants.pipedriveOptions[name];
            const currOption = currKeyOptions.find((option) => option?.label === curr || option?.labelPL === curr);

            return currOption ? { option: currOption, key: currOption.customKey || key } : null;
          })
          .filter(Boolean);

        if (arrayOfOptions?.length) {
          const groupedArrays = groupBy(arrayOfOptions, "key");
          groupedArrays.forEach((array) => {
            const arrayKey = array[0].key;
            const arrayOfIds = array.map(({ option }) => option.id);
            acc[arrayKey] = arrayOfIds.join(",");
          });
        }

        return acc;
      }

      acc[key] = value;
    }

    return acc;
  }, {});

  return customFields;
};
