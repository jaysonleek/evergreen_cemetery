/* === search.js (no Fuse.js) === */

let DATA = [];

// DOM elements
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results-container");
const detailContainer = document.getElementById("detail-container");

// Load the dataset from ROOT
async function loadData() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    DATA = await response.json();
    console.log(`Loaded ${DATA.length} burial records.`);
  } catch (err) {
    console.error("Error loading data.json:", err);
    resultsContainer.innerHTML = `
      <p class="results-placeholder" style="color:red;">
        Error loading data. Please check console.
      </p>
    `;
  }
}

// Simple case-insensitive substring match
function searchRecords(query) {
  const q = query.toLowerCase();

  return DATA.filter((rec) => {
    const fields = [
      rec.First_Name,
      rec.Middle_Name,
      rec.Last_Name,
      rec.Maiden_Name,
      rec.Alternate_Name,
      rec.Display_Name
    ];

    return fields.some((v) => v && v.toLowerCase().includes(q));
  }).slice(0, 50);
}

// Render search results
function renderResults(results) {
  if (!results.length) {
    resultsContainer.innerHTML = `
      <p class="results-placeholder">No matches found.</p>
    `;
    return;
  }

  resultsContainer.innerHTML = results
    .map(
      (item) => `
      <div class="result-item" data-id="${item.Global_Burial_ID}">
        <div class="result-name">${item.Display_Name}</div>
        <div class="result-location">${item.Burial_Location_Short || ""}</div>
      </div>
    `
    )
    .join("");

  document.querySelectorAll(".result-item").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-id");
      const record = DATA.find((r) => r.Global_Burial_ID === id);
      renderDetail(record);
    });
  });
}

// Render detail view
function renderDetail(rec) {
  if (!rec) {
    detailContainer.innerHTML = `
      <p class="detail-placeholder">No record selected.</p>
    `;
    return;
  }

  const safe = (v) =>
    v && String(v).trim() !== ""
      ? v
      : "<span style='color:#777'>(none)</span>";

  detailContainer.innerHTML = `
    <div class="detail-field"><span class="detail-label">Name:</span> ${safe(rec.Display_Name)}</div>
    <div class="detail-field"><span class="detail-label">Maiden Name:</span> ${safe(rec.Maiden_Name)}</div>
    <div class="detail-field"><span class="detail-label">Alternate Name:</span> ${safe(rec.Alternate_Name)}</div>
    <div class="detail-field"><span class="detail-label">Birth:</span> ${safe(rec.Birth_Date_ISO)}</div>
    <div class="detail-field"><span class="detail-label">Death:</span> ${safe(rec.Death_Date_ISO)}</div>
    <div class="detail-field"><span class="detail-label">Burial Location:</span> ${safe(rec.Burial_Location_Short)}</div>
    <div class="detail-field"><span class="detail-label">Location Notes:</span> ${safe(rec.Burial_Location_Notes)}</div>
    <div class="detail-field"><span class="detail-label">Relationship Note:</span> ${safe(rec.Relationship_Note)}</div>
    <div class="detail-field"><span class="detail-label">Narrative Note:</span> ${safe(rec.Narrative_Note)}</div>
    <div class="detail-field"><span class="detail-label">Record Source:</span> ${safe(rec.Source_File)} (row ${safe(rec.Source_Row)})</div>
  `;
}

// Handle search input
function handleSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    resultsContainer.innerHTML = `
      <p class="results-placeholder">Start typing a name above.</p>
    `;
    detailContainer.innerHTML = `
      <p class="detail-placeholder">Select a result to see full details here.</p>
    `;
    return;
  }

  renderResults(searchRecords(query));
}

// Initialize
window.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  searchInput.addEventListener("input", handleSearch);
});
