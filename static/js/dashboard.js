let currentEmployees = [];
let filteredEmployees = [];
let currentPage = 1;
const employeesPerPage = 5;

function initializeDashboard(emailCategories, deptStats, employees) {
    currentEmployees = employees;
    filteredEmployees = [...employees];
    
    // Initialize charts
    initializePieChart(emailCategories);
    initializeBarChart(deptStats);
    
    // Initialize employees table
    renderEmployeesTable();
    setupFilters();
}

function initializePieChart(emailCategories) {
    const ctx = document.getElementById('emailPieChart').getContext('2d');
    
    // Translate category names to Arabic
    const arabicCategories = {
        'Organization': 'المؤسسة',
        'Lab': 'المختبر',
        'Request': 'الطلبات',
        'Other': 'أخرى'
    };
    
    const labels = Object.keys(emailCategories).map(key => arabicCategories[key] || key);
    const data = Object.values(emailCategories);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#17B26A',
                    '#1570EF', 
                    '#F79009',
                    '#F04438'
                ],
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Tajawal',
                            size: 12
                        },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    titleFont: {
                        family: 'Tajawal'
                    },
                    bodyFont: {
                        family: 'Tajawal'
                    }
                }
            }
        }
    });
}

function initializeBarChart(deptStats) {
    const ctx = document.getElementById('departmentBarChart').getContext('2d');
    
    const labels = Object.keys(deptStats);
    const data = Object.values(deptStats);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'عدد الموظفين',
                data: data,
                backgroundColor: '#1570EF',
                borderColor: '#1849A9',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                },
                tooltip: {
                    titleFont: {
                        family: 'Tajawal'
                    },
                    bodyFont: {
                        family: 'Tajawal'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                }
            }
        }
    });
}

function renderEmployeesTable() {
    const tbody = document.getElementById('employeesTableBody');
    const startIndex = (currentPage - 1) * employeesPerPage;
    const endIndex = startIndex + employeesPerPage;
    const pageEmployees = filteredEmployees.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    pageEmployees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.email}</td>
            <td>${employee.department.toUpperCase()}</td>
            <td><span class="badge bg-primary">${employee.total}</span></td>
            <td><span class="badge bg-success">${employee.done}</span></td>
        `;
        tbody.appendChild(row);
    });
    
    renderPagination();
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
    
    pagination.innerHTML = '';
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage - 1})" aria-label="السابق">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    pagination.appendChild(prevLi);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="javascript:void(0)" onclick="changePage(${i})">${i}</a>`;
        pagination.appendChild(li);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage + 1})" aria-label="التالي">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    pagination.appendChild(nextLi);
}

function changePage(page) {
    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderEmployeesTable();
    }
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const deptFilter = document.getElementById('deptFilter');
    const dayFilter = document.getElementById('dayFilter');
    
    searchInput.addEventListener('input', applyFilters);
    deptFilter.addEventListener('change', applyFilters);
    dayFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const deptFilter = document.getElementById('deptFilter').value;
    const dayFilter = document.getElementById('dayFilter').value;
    
    filteredEmployees = currentEmployees.filter(employee => {
        // Search filter
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm) ||
                            employee.email.toLowerCase().includes(searchTerm);
        
        // Department filter
        const matchesDept = !deptFilter || employee.department === deptFilter;
        
        // Day filter
        let matchesDay = true;
        if (dayFilter) {
            matchesDay = employee[dayFilter] === true;
        }
        
        return matchesSearch && matchesDept && matchesDay;
    });
    
    currentPage = 1;
    renderEmployeesTable();
}
