import Papa from "papaparse";

import "./style.css";

const fileInput = document.getElementById("file-input") as HTMLInputElement;
const loader = document.getElementById("loader")!;
const searchInput = document.querySelector(
  ".search-input"
) as HTMLInputElement;
const prevBtn = document.getElementById("prev") as HTMLButtonElement;
const nextBtn = document.getElementById("next") as HTMLButtonElement;
const fastPrevBtn = document.getElementById("fast-prev") as HTMLButtonElement;
const fastNextBtn = document.getElementById("fast-next") as HTMLButtonElement;
const pageNumbersContainer = document.getElementById("page-numbers")!;
const tbody = document.querySelector("tbody")!;

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

function renderPageNumbers(totalPages: number) {
  pageNumbersContainer.innerHTML = "";
  
  // Calculate start and end pages for the current block of 10
  const currentBlock = Math.floor((currentPage - 1) / 10);
  const startPage = currentBlock * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("div");
    btn.textContent = String(i);
    btn.className = `page-btn ${i === currentPage ? "active" : ""}`;
    btn.addEventListener("click", () => {
      currentPage = i;
      displayData(currentFilteredData, currentPage);
    });
    pageNumbersContainer.appendChild(btn);
  }
}

function updatePagination(totalItems: number) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  renderPageNumbers(totalPages);
  
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
  
  // Fast navigation logic
  fastPrevBtn.disabled = currentPage <= 10;
  fastNextBtn.disabled = currentPage > totalPages - 10;
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

const modal = document.getElementById("row-modal") as HTMLDivElement;
const modalBody = document.getElementById("modal-body") as HTMLDivElement;
const closeButton = document.querySelector(".close-button") as HTMLSpanElement;

tbody.addEventListener("click", (event) => {
  const target = event.target as HTMLTableCellElement;
  const row = target.closest("tr");
  if (!row) return;

  const index = Array.from(row.parentNode!.children).indexOf(row);
  
  // Calculate the actual index in the data array
  const dataIndex = (currentPage - 1) * itemsPerPage + index;
  const rowData = currentFilteredData[dataIndex];

  if (rowData) {
    modalBody.innerHTML = "";
    Object.entries(rowData).forEach(([key, value]) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "detail-item";
      
      const label = document.createElement("div");
      label.className = "detail-label";
      label.textContent = key;
      
      const valDiv = document.createElement("div");
      valDiv.className = "detail-value";
      valDiv.textContent = String(value);
      
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      copyBtn.title = "Copiar";
      
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(String(value)).then(() => {
          copyBtn.classList.add("copied");
          copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          setTimeout(() => {
            copyBtn.classList.remove("copied");
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
          }, 2000);
        });
      });
      
      itemDiv.appendChild(label);
      itemDiv.appendChild(valDiv);
      itemDiv.appendChild(copyBtn);
      modalBody.appendChild(itemDiv);
    });
    modal.style.display = "block";
  }
});

closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

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

fastPrevBtn.addEventListener("click", () => {
  if (currentPage > 10) {
    currentPage -= 10;
    displayData(currentFilteredData, currentPage);
  } else {
    currentPage = 1;
    displayData(currentFilteredData, currentPage);
  }
});

fastNextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(currentFilteredData.length / itemsPerPage);
  if (currentPage <= totalPages - 10) {
    currentPage += 10;
    displayData(currentFilteredData, currentPage);
  } else {
    currentPage = totalPages;
    displayData(currentFilteredData, currentPage);
  }
});

const noDataMessage = document.getElementById("no-data-message")!;

// Initial state: disable controls
searchInput.disabled = true;
prevBtn.disabled = true;
nextBtn.disabled = true;
noDataMessage.style.display = "block";

function updateControlsState(hasData: boolean) {
  searchInput.disabled = !hasData;
  noDataMessage.style.display = hasData ? "none" : "block";
  
  if (!hasData) {
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }
}

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
  updateControlsState(true);
  loader.style.display = "none";
} else {
  updateControlsState(false);
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
  updateControlsState(true);

  loader.style.display = "none";
});
