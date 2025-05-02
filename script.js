// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data storage
    if (!localStorage.getItem('members')) {
        initializeData();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboard();
    loadMembers();
    populateCertificateMembers();
    
    // Set default dates
    setDefaultDates();
});

// Initialize sample data
function initializeData() {
    const sampleMembers = [
        {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            phone: "555-123-4567",
            address: "123 Main St, Anytown, USA",
            dob: "1985-05-15",
            status: "active",
            joinDate: "2020-01-15",
            certificates: []
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "555-987-6543",
            address: "456 Oak Ave, Somewhere, USA",
            dob: "1990-11-22",
            status: "active",
            joinDate: "2021-03-10",
            certificates: [
                {
                    type: "membership",
                    date: "2021-03-10"
                }
            ]
        },
        {
            id: 3,
            name: "Robert Johnson",
            email: "robert@example.com",
            phone: "555-555-5555",
            address: "789 Pine Rd, Nowhere, USA",
            dob: "1978-07-30",
            status: "inactive",
            joinDate: "2019-05-20",
            certificates: [
                {
                    type: "membership",
                    date: "2019-05-20"
                },
                {
                    type: "achievement",
                    date: "2020-12-15"
                }
            ]
        }
    ];
    
    const settings = {
        orgName: "Our Organization",
        orgLogo: "",
        certificateTheme: "classic"
    };
    
    localStorage.setItem('members', JSON.stringify(sampleMembers));
    localStorage.setItem('settings', JSON.stringify(settings));
    localStorage.setItem('activityLog', JSON.stringify([]));
}

// Set up all event listeners
function setupEventListeners() {
    // Tab navigation
    const tabLinks = document.querySelectorAll('.sidebar li');
    tabLinks.forEach(link => {
        link.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Member form submission
    document.getElementById('add-member-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addNewMember();
    });
    
    // Member search and filter
    document.getElementById('member-search').addEventListener('input', filterMembers);
    document.getElementById('member-filter').addEventListener('change', filterMembers);
    
    // Pagination
    document.getElementById('prev-page').addEventListener('click', previousPage);
    document.getElementById('next-page').addEventListener('click', nextPage);
    
    // Certificate generation
    document.getElementById('generate-certificate').addEventListener('click', updateCertificatePreview);
    document.getElementById('download-certificate').addEventListener('click', downloadCertificate);
    
    // Settings form
    document.getElementById('settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
    
    // Backup and restore
    document.getElementById('backup-data').addEventListener('click', backupData);
    document.getElementById('restore-data').addEventListener('change', restoreData);
    
    // Modal close button
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Click outside modal to close
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('member-modal')) {
            closeModal();
        }
    });
}

// Switch between tabs
function switchTab(tabId) {
    // Update active tab in sidebar
    document.querySelectorAll('.sidebar li').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.sidebar li[data-tab="${tabId}"]`).classList.add('active');
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    
    // Load data for the tab if needed
    if (tabId === 'dashboard') {
        loadDashboard();
    } else if (tabId === 'members') {
        loadMembers();
    } else if (tabId === 'certificates') {
        populateCertificateMembers();
    }
}

// Load dashboard data
function loadDashboard() {
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
    
    // Update stats
    document.getElementById('total-members').textContent = members.length;
    document.getElementById('active-members').textContent = members.filter(m => m.status === 'active').length;
    
    const totalCertificates = members.reduce((total, member) => total + member.certificates.length, 0);
    document.getElementById('certificates-issued').textContent = totalCertificates;
    
    // Update activity log
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    
    const recentActivities = activityLog.slice(-5).reverse();
    recentActivities.forEach(activity => {
        const li = document.createElement('li');
        li.textContent = `${activity.action} - ${new Date(activity.timestamp).toLocaleString()}`;
        activityList.appendChild(li);
    });
}

// Load members table
let currentPage = 1;
const membersPerPage = 5;

function loadMembers(page = 1) {
    currentPage = page;
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const filteredMembers = filterMembersList(members);
    
    const startIndex = (page - 1) * membersPerPage;
    const endIndex = startIndex + membersPerPage;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);
    
    const membersTable = document.getElementById('members-table').querySelector('tbody');
    membersTable.innerHTML = '';
    
    if (paginatedMembers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" style="text-align: center;">No members found</td>`;
        membersTable.appendChild(row);
    } else {
        paginatedMembers.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.id}</td>
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td>${formatDate(member.joinDate)}</td>
                <td><span class="status-badge status-${member.status}">${member.status.charAt(0).toUpperCase() + member.status.slice(1)}</span></td>
                <td>
                    <button class="btn btn-secondary edit-member" data-id="${member.id}">Edit</button>
                </td>
            `;
            membersTable.appendChild(row);
        });
    }
    
    // Update pagination info
    const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
    document.getElementById('page-info').textContent = `Page ${page} of ${totalPages}`;
    
    // Disable/enable pagination buttons
    document.getElementById('prev-page').disabled = page === 1;
    document.getElementById('next-page').disabled = page === totalPages || totalPages === 0;
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-member').forEach(button => {
        button.addEventListener('click', function() {
            const memberId = parseInt(this.getAttribute('data-id'));
            openEditModal(memberId);
        });
    });
}

// Filter members based on search and filter criteria
function filterMembers() {
    loadMembers(1);
}

function filterMembersList(members) {
    const searchTerm = document.getElementById('member-search').value.toLowerCase();
    const filterValue = document.getElementById('member-filter').value;
    
    return members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm) || 
                             member.email.toLowerCase().includes(searchTerm);
        
        const matchesFilter = filterValue === 'all' || member.status === filterValue;
        
        return matchesSearch && matchesFilter;
    });
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        loadMembers(currentPage - 1);
    }
}

function nextPage() {
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const filteredMembers = filterMembersList(members);
    const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
    
    if (currentPage < totalPages) {
        loadMembers(currentPage + 1);
    }
}

// Add new member
function addNewMember() {
    const form = document.getElementById('add-member-form');
    const members = JSON.parse(localStorage.getItem('members')) || [];
    
    const newMember = {
        id: members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1,
        name: document.getElementById('member-name').value,
        email: document.getElementById('member-email').value,
        phone: document.getElementById('member-phone').value,
        address: document.getElementById('member-address').value,
        dob: document.getElementById('member-dob').value,
        status: document.getElementById('member-status').value,
        joinDate: document.getElementById('member-join-date').value,
        certificates: []
    };
    
    members.push(newMember);
    localStorage.setItem('members', JSON.stringify(members));
    
    // Log activity
    logActivity(`Added new member: ${newMember.name}`);
    
    // Reset form
    form.reset();
    
    // Show success message
    alert('Member added successfully!');
    
    // Reload members list
    loadMembers();
    loadDashboard();
    populateCertificateMembers();
    
    // Switch to members tab
    switchTab('members');
}

// Open edit modal
function openEditModal(memberId) {
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const member = members.find(m => m.id === memberId);
    
    if (member) {
        document.getElementById('edit-member-id').value = member.id;
        document.getElementById('edit-member-name').value = member.name;
        document.getElementById('edit-member-email').value = member.email;
        document.getElementById('edit-member-status').value = member.status;
        
        // Set up form submission
        document.getElementById('edit-member-form').onsubmit = function(e) {
            e.preventDefault();
            saveMemberChanges();
        };
        
        // Set up delete button
        document.getElementById('delete-member').onclick = function() {
            if (confirm('Are you sure you want to delete this member?')) {
                deleteMember(memberId);
            }
        };
        
        // Show modal
        document.getElementById('member-modal').style.display = 'block';
    }
}

// Save member changes
function saveMemberChanges() {
    const memberId = parseInt(document.getElementById('edit-member-id').value);
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const memberIndex = members.findIndex(m => m.id === memberId);
    
    if (memberIndex !== -1) {
        members[memberIndex].name = document.getElementById('edit-member-name').value;
        members[memberIndex].email = document.getElementById('edit-member-email').value;
        members[memberIndex].status = document.getElementById('edit-member-status').value;
        
        localStorage.setItem('members', JSON.stringify(members));
        
        // Log activity
        logActivity(`Updated member: ${members[memberIndex].name}`);
        
        // Close modal
        closeModal();
        
        // Reload data
        loadMembers(currentPage);
        loadDashboard();
        populateCertificateMembers();
    }
}

// Delete member
function deleteMember(memberId) {
    let members = JSON.parse(localStorage.getItem('members')) || [];
    const member = members.find(m => m.id === memberId);
    
    if (member) {
        members = members.filter(m => m.id !== memberId);
        localStorage.setItem('members', JSON.stringify(members));
        
        // Log activity
        logActivity(`Deleted member: ${member.name}`);
        
        // Close modal
        closeModal();
        
        // Reload data
        loadMembers(1);
        loadDashboard();
        populateCertificateMembers();
    }
}

// Close modal
function closeModal() {
    document.getElementById('member-modal').style.display = 'none';
}

// Certificate functions
function populateCertificateMembers() {
    const memberSelect = document.getElementById('certificate-member');
    memberSelect.innerHTML = '';
    
    const members = JSON.parse(localStorage.getItem('members')) || [];
    
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} (${member.email})`;
        memberSelect.appendChild(option);
    });
}

function updateCertificatePreview() {
    const memberId = parseInt(document.getElementById('certificate-member').value);
    const certificateType = document.getElementById('certificate-type').value;
    const issueDate = document.getElementById('certificate-date').value;
    
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const member = members.find(m => m.id === memberId);
    
    if (member) {
        // Update certificate preview
        document.getElementById('certificate-member-name').textContent = member.name;
        document.getElementById('certificate-join-date').textContent = formatDate(member.joinDate);
        document.getElementById('certificate-issue-date').textContent = formatDate(issueDate);
        
        // Update certificate title based on type
        const certificateHeader = document.querySelector('.certificate-header h1');
        switch (certificateType) {
            case 'membership':
                certificateHeader.textContent = 'CERTIFICATE OF MEMBERSHIP';
                break;
            case 'achievement':
                certificateHeader.textContent = 'CERTIFICATE OF ACHIEVEMENT';
                break;
            case 'completion':
                certificateHeader.textContent = 'CERTIFICATE OF COMPLETION';
                break;
            case 'appreciation':
                certificateHeader.textContent = 'CERTIFICATE OF APPRECIATION';
                break;
        }
    }
}

function downloadCertificate() {
    const certificateElement = document.getElementById('certificate-template');
    const memberId = parseInt(document.getElementById('certificate-member').value);
    const certificateType = document.getElementById('certificate-type').value;
    const issueDate = document.getElementById('certificate-date').value;
    
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const member = members.find(m => m.id === memberId);
    
    if (member && issueDate) {
        // Add certificate to member's record
        member.certificates.push({
            type: certificateType,
            date: issueDate
        });
        localStorage.setItem('members', JSON.stringify(members));
        
        // Log activity
        logActivity(`Generated ${certificateType} certificate for ${member.name}`);
        
        // Generate PDF
        html2canvas(certificateElement).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('landscape');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;
            
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`Certificate_${member.name.replace(/\s+/g, '_')}_${issueDate}.pdf`);
        });
        
        // Reload dashboard to update stats
        loadDashboard();
    } else {
        alert('Please select a member and issue date before downloading.');
    }
}

// Settings functions
function saveSettings() {
    const settings = {
        orgName: document.getElementById('org-name').value,
        orgLogo: document.getElementById('org-logo').value,
        certificateTheme: document.getElementById('certificate-theme').value
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Log activity
    logActivity('Updated application settings');
    
    alert('Settings saved successfully!');
}

function backupData() {
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
    
    const backup = {
        members,
        settings,
        activityLog,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MemberHub_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Log activity
    logActivity('Created data backup');
}

function restoreData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (confirm('Are you sure you want to restore from backup? All current data will be replaced.')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backup = JSON.parse(e.target.result);
                
                if (backup.members && backup.settings && backup.activityLog) {
                    localStorage.setItem('members', JSON.stringify(backup.members));
                    localStorage.setItem('settings', JSON.stringify(backup.settings));
                    localStorage.setItem('activityLog', JSON.stringify(backup.activityLog));
                    
                    // Log activity
                    logActivity('Restored data from backup');
                    
                    // Reload all data
                    loadDashboard();
                    loadMembers();
                    populateCertificateMembers();
                    
                    alert('Data restored successfully!');
                } else {
                    alert('Invalid backup file format.');
                }
            } catch (error) {
                alert('Error reading backup file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    
    // Reset file input
    e.target.value = '';
}

// Activity log
function logActivity(action) {
    const activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
    activityLog.push({
        action,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('member-join-date').value = today;
    document.getElementById('certificate-date').value = today;
}