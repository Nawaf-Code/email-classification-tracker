let employees = [];
let filteredEmployees = [];
let currentPage = 1;
const employeesPerPage = 5;
let editingEmployeeId = null;

function initializeEmployeesPage(initialEmployees) {
    employees = [...initialEmployees];
    filteredEmployees = [...employees];
    
    renderEmployeesTable();
    setupFilters();
}

function renderEmployeesTable() {
    const tbody = document.getElementById('employeesTableBody');
    const startIndex = (currentPage - 1) * employeesPerPage;
    const endIndex = startIndex + employeesPerPage;
    const pageEmployees = filteredEmployees.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    pageEmployees.forEach(employee => {
        const row = document.createElement('tr');
        
        // Format working days
        const workingDays = [];
        if (employee.suntue) workingDays.push('أح-ث');
        if (employee.wedthu) workingDays.push('أر-خ');
        if (employee.frisat) workingDays.push('ج-س');
        
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.email}</td>
            <td><span class="badge bg-secondary">${employee.department.toUpperCase()}</span></td>
            <td><span class="badge bg-primary">${employee.total}</span></td>
            <td><span class="badge bg-success">${employee.done}</span></td>
            <td>${employee.shift}</td>
            <td><span class="badge bg-warning">${employee.score}</span></td>
            <td>
                ${workingDays.map(day => `<span class="badge bg-info me-1">${day}</span>`).join('')}
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editEmployee(${employee.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${employee.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    renderPagination();
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
    
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
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
    
    filteredEmployees = employees.filter(employee => {
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

function saveEmployee() {
    const form = document.getElementById('addEmployeeForm');
    const formData = new FormData(form);
    
    // Generate new ID
    const newId = Math.max(...employees.map(e => e.id)) + 1;
    
    const newEmployee = {
        id: newId,
        name: formData.get('name'),
        email: formData.get('email'),
        department: formData.get('department'),
        shift: formData.get('shift'),
        score: parseInt(formData.get('score')),
        total: parseInt(formData.get('total')),
        done: parseInt(formData.get('done')),
        suntue: formData.has('suntue'),
        wedthu: formData.has('wedthu'),
        frisat: formData.has('frisat')
    };
    
    employees.push(newEmployee);
    applyFilters();
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('addEmployeeModal'));
    modal.hide();
    form.reset();
    
    // Update server
    updateServerEmployees();
}

function editEmployee(id) {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;
    
    editingEmployeeId = id;
    
    // Populate form
    const form = document.getElementById('editEmployeeForm');
    form.elements['id'].value = employee.id;
    form.elements['name'].value = employee.name;
    form.elements['email'].value = employee.email;
    form.elements['department'].value = employee.department;
    form.elements['shift'].value = employee.shift;
    form.elements['score'].value = employee.score;
    form.elements['total'].value = employee.total;
    form.elements['done'].value = employee.done;
    form.elements['suntue'].checked = employee.suntue;
    form.elements['wedthu'].checked = employee.wedthu;
    form.elements['frisat'].checked = employee.frisat;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editEmployeeModal'));
    modal.show();
}

function updateEmployee() {
    const form = document.getElementById('editEmployeeForm');
    const formData = new FormData(form);
    
    const employeeIndex = employees.findIndex(e => e.id === editingEmployeeId);
    if (employeeIndex === -1) return;
    
    employees[employeeIndex] = {
        id: editingEmployeeId,
        name: formData.get('name'),
        email: formData.get('email'),
        department: formData.get('department'),
        shift: formData.get('shift'),
        score: parseInt(formData.get('score')),
        total: parseInt(formData.get('total')),
        done: parseInt(formData.get('done')),
        suntue: formData.has('suntue'),
        wedthu: formData.has('wedthu'),
        frisat: formData.has('frisat')
    };
    
    applyFilters();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal'));
    modal.hide();
    
    editingEmployeeId = null;
    
    // Update server
    updateServerEmployees();
}

function deleteEmployee(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    
    employees = employees.filter(e => e.id !== id);
    applyFilters();
    
    // Update server
    updateServerEmployees();
}

function updateServerEmployees() {
    fetch('/api/employees', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(employees)
    }).catch(error => {
        console.error('Error updating employees:', error);
    });
}
