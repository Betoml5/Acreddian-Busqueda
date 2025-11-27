import Papa from "papaparse";

import "./style.css";

const fileInput = document.getElementById("file-input") as HTMLInputElement;
const loader = document.getElementById("loader")!;
const searchInput = document.querySelector(
  'input[placeholder="Buscar"]'
) as HTMLInputElement;
const prevBtn = document.getElementById("prev") as HTMLButtonElement;
const nextBtn = document.getElementById("next") as HTMLButtonElement;
const pageInfo = document.getElementById("page-info")!;

let allData: any[] = [];
let currentPage = 1;
const itemsPerPage = 50;
let currentFilteredData: any[] = [];

function setHeaders(data: any[]) {
  if (data.length > 0) {
    const headers = Object.keys(data[0] as Record<string, any>);
    const thead = document.querySelector("thead")!;
    thead.innerHTML = "";
    const headerRow = document.createElement("tr");
    headers.forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
  }
}

function displayRows(data: any[]) {
  const tbody = document.querySelector("tbody")!;
  tbody.innerHTML = "";
  data.forEach((item) => {
    const tr = document.createElement("tr");
    const headers = Object.keys(data[0] as Record<string, any>);
    headers.forEach((header) => {
      const td = document.createElement("td");
      td.textContent = (item as Record<string, any>)[header] || "";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function displayData(data: any[], page: number = 1) {
  if (data.length > 0) {
    setHeaders(data);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = data.slice(start, end);
    displayRows(pageData);
    updatePagination(data.length);
  } else {
    // If no data, clear table
    const thead = document.querySelector("thead")!;
    thead.innerHTML = "";
    const tbody = document.querySelector("tbody")!;
    tbody.innerHTML = "";
    updatePagination(0);
  }
}

function updatePagination(totalItems: number) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

function filterAndDisplay() {
  const term = searchInput.value.toLowerCase();
  currentFilteredData = allData.filter((item) => {
    return Object.values(item as Record<string, any>).some((value) =>
      String(value).toLowerCase().includes(term)
    );
  });
  currentPage = 1;
  displayData(currentFilteredData, currentPage);
}

searchInput.addEventListener("input", filterAndDisplay);

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayData(currentFilteredData, currentPage);
  }
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(currentFilteredData.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayData(currentFilteredData, currentPage);
  }
});

// Load saved data on page load
const savedCsv = localStorage.getItem("csvText");
if (savedCsv) {
  loader.style.display = "flex";
  const data = Papa.parse(savedCsv, {
    header: true,
    skipEmptyLines: true,
  }).data;
  allData = data;
  currentFilteredData = data;
  displayData(data);
  loader.style.display = "none";
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  loader.style.display = "flex";

  const csv = await file.text();
  const data = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  }).data;

  allData = data;
  currentFilteredData = data;
  try {
    localStorage.setItem("csvText", csv);
  } catch (e) {
    console.warn("Data too large to save locally:", e);
  }
  displayData(data);

  loader.style.display = "none";
});
