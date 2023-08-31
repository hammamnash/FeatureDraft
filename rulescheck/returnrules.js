// Function to generate random rules
function generateRandomRules() {
  const countries = ["ID", "VN"];
  const warehouses = ["B2C", "B2B", "Store"];
  const brandVariants = Array.from({ length: 100 }, (_, index) => `Brand${index + 1}`);
  const labelVariants = ["Delete", "Keep", "Upload", "Modify"]; // 4 label possibilities
  const rulesArray = [];

  for (let i = 1; i <= 2000; i++) {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];

    const rule = {
      rule: `Rule${i}`,
      minValue: Math.floor(Math.random() * 19), // Between 0 and 18
      maxValue: Math.floor(Math.random() * 19), // Between 0 and 18
      label: labelVariants[Math.floor(Math.random() * labelVariants.length)], // Random label
      country,
      warehouse,
      brand: brandVariants[Math.floor(Math.random() * brandVariants.length)]
    };

    rulesArray.push(rule);
  }

  console.log('Random rules generated:', rulesArray);

  // Export rulesArray as CSV
  const csvData = [
    Object.keys(rulesArray[0]).join(','), // CSV header with property names
    ...rulesArray.map(rule => Object.values(rule).join(',')) // CSV data rows
  ].join('\n');

  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'random_rules.csv';
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Function to check if two rules are mutually exclusive
function areRulesMutuallyExclusive(rule1, rule2) {
  return (
    (rule1.minValue < rule2.minValue && rule1.maxValue > rule2.minValue) ||
    (rule2.minValue < rule1.minValue && rule2.maxValue > rule1.minValue)
  ) && (
    rule1.country === rule2.country &&
    rule1.warehouse === rule2.warehouse &&
    rule1.brand === rule2.brand
  );
}

// Function to check for mutually exclusive rules and return unique non-mutually exclusive rules
function checkMutualExclusion(rulesArray) {
  const nonMutuallyExclusiveRules = [];

  for (let i = 0; i < rulesArray.length; i++) {
    for (let j = i + 1; j < rulesArray.length; j++) {
      const rule1 = rulesArray[i];
      const rule2 = rulesArray[j];

      if (areRulesMutuallyExclusive(rule1, rule2)) {
        nonMutuallyExclusiveRules.push([rule1, rule2]);
      }
    }
  }

  return nonMutuallyExclusiveRules;
}

// Function to generate CSV data from an array of rules
function generateCSVData(rules) {
  return [
    Object.keys(rules[0]).join(','), // CSV header with property names
    ...rules.map(rule => Object.values(rule).join(',')) // CSV data rows
  ].join('\n');
}

// Function to export CSV data as a file
function exportCSV(data, filename) {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Function to check mutually exclusive rules from uploaded CSV file
function checkMutuallyExclusiveFromCSV(csvData) {
  Papa.parse(csvData, {
    header: true,
    complete: function(parsedData) {
      const rulesArray = parsedData.data;

      const nonMutuallyExclusiveRules = checkMutualExclusion(rulesArray);

      const resultSection = document.getElementById('resultSection');
      if (nonMutuallyExclusiveRules.length === 0) {
        resultSection.innerHTML = 'All rules are mutually exclusive.';
      } else {
        const resultHtml = nonMutuallyExclusiveRules.map(
          pair => `<p>Rules ${pair[0].rule} and ${pair[1].rule} are not mutually exclusive.</p>`
        ).join('');
        resultSection.innerHTML = resultHtml;
      }
    }
  });
}

// Get references to the buttons and file input
const generateRulesBtn = document.getElementById('generateRulesBtn');
const checkMutuallyExclusiveBtn = document.getElementById('checkMutuallyExclusiveBtn');
const csvFileInput = document.getElementById('csvFileInput');

// Event listener for the "Generate Random Rules" button
generateRulesBtn.addEventListener('click', generateRandomRules);

// Event listener for the "Check Mutually Exclusive" button
checkMutuallyExclusiveBtn.addEventListener('click', () => {
  const file = csvFileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const csvData = event.target.result;
      const rulesArray = Papa.parse(csvData, { header: true }).data;
      const nonMutuallyExclusiveRules = checkMutualExclusion(rulesArray);

      const resultSection = document.getElementById('resultSection');
      if (nonMutuallyExclusiveRules.length === 0) {
        resultSection.innerHTML = 'All rules are mutually exclusive.';
      } else {
        const resultHtml = nonMutuallyExclusiveRules.map(
          pair => `<p>Rules ${pair[0].rule} and ${pair[1].rule} are not mutually exclusive.</p>`
        ).join('');
        resultSection.innerHTML = resultHtml;

        const uniqueRules = [...new Set(nonMutuallyExclusiveRules.flat().map(rule => rule.rule))];
        const uniqueRulesArray = rulesArray.filter(rule => uniqueRules.includes(rule.rule));
        const csvDataForUniqueRules = generateCSVData(uniqueRulesArray);
        exportCSV(csvDataForUniqueRules, 'non_mutually_exclusive_rules.csv');
      }
    };
    reader.readAsText(file);
  } else {
    console.log('Please select a CSV file.');
  }
});
