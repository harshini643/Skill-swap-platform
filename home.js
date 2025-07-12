// Home page functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginRequired = document.getElementById('loginRequired');
    const mainContent = document.getElementById('mainContent');
    const profilesContainer = document.getElementById('profilesContainer');
    const searchInput = document.getElementById('searchInput');
    const availabilityFilter = document.getElementById('availabilityFilter');
    const pagination = document.getElementById('pagination');
    const requestModal = document.getElementById('requestModal');
    const closeModal = document.getElementById('closeModal');
    const submitRequest = document.getElementById('submitRequest');

    let currentUser = getCurrentUser();
    let allUsers = [];
    let filteredUsers = [];
    let currentPage = 1;
    let usersPerPage = 3;
    let selectedUser = null;

    // Initialize sample data
    initializeSampleData();

    // Check authentication and show appropriate content
    if (isAuthenticated()) {
        loginRequired.style.display = 'none';
        mainContent.style.display = 'block';
        updateNavigation();
        loadAllUsers();
    } else {
        loginRequired.style.display = 'flex';
        mainContent.style.display = 'none';
    }

    // Search and filter functionality
    if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
    }
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', filterUsers);
    }

    // Modal functionality
    if (closeModal) {
        closeModal.addEventListener('click', closeRequestModal);
    }

    if (requestModal) {
        requestModal.addEventListener('click', function(e) {
            if (e.target === requestModal) {
                closeRequestModal();
            }
        });
    }

    if (submitRequest) {
        submitRequest.addEventListener('click', handleSubmitRequest);
    }

    function loadAllUsers() {
        const users = getFromLocalStorage('users') || [];
        const skills = getFromLocalStorage('skills') || [];
        
        // Filter out current user and create user profiles with their skills
        allUsers = users
            .filter(user => user.profileVisibility === 'public' && (!currentUser || user.id !== currentUser.id))
            .map(user => {
                const userSkills = skills.filter(skill => skill.userId === user.id);
                const teachingSkills = userSkills.filter(skill => skill.type === 'teach');
                const learningSkills = userSkills.filter(skill => skill.type === 'learn');
                
                return {
                    ...user,
                    teachingSkills,
                    learningSkills
                };
            });

        filteredUsers = [...allUsers];
        renderUsers();
    }

    function filterUsers() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedAvailability = availabilityFilter ? availabilityFilter.value : '';

        filteredUsers = allUsers.filter(user => {
            const nameMatch = user.username.toLowerCase().includes(searchTerm);
            const skillMatch = [...user.teachingSkills, ...user.learningSkills]
                .some(skill => skill.title.toLowerCase().includes(searchTerm));
            const searchMatch = !searchTerm || nameMatch || skillMatch;
            
            const availabilityMatch = !selectedAvailability || user.availability === selectedAvailability;
            
            return searchMatch && availabilityMatch;
        });

        currentPage = 1;
        renderUsers();
    }

    function renderUsers() {
        const startIndex = (currentPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const usersToShow = filteredUsers.slice(startIndex, endIndex);

        if (usersToShow.length === 0) {
            profilesContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No users found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            renderPagination();
            return;
        }

        profilesContainer.innerHTML = usersToShow.map(user => `
            <div class="profile-card">
                <img src="${user.profileImage || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop'}" 
                     alt="${user.username}" class="profile-photo">
                
                <div class="profile-info">
                    <h3 class="profile-name">${user.username}</h3>
                    
                    <div class="skills-section">
                        <div class="skills-row">
                            <div class="skills-group">
                                <div class="skills-label">Skills Offered</div>
                                <div class="skills-tags">
                                    ${user.teachingSkills.length > 0 ? 
                                        user.teachingSkills.slice(0, 2).map(skill => `
                                            <span class="skill-tag offered">${skill.title}</span>
                                        `).join('') : 
                                        '<span class="skill-tag">None</span>'
                                    }
                                    ${user.teachingSkills.length > 2 ? `<span class="skill-tag">+${user.teachingSkills.length - 2}</span>` : ''}
                                </div>
                            </div>
                            
                            <div class="skills-group">
                                <div class="skills-label">Skills Wanted</div>
                                <div class="skills-tags">
                                    ${user.learningSkills.length > 0 ? 
                                        user.learningSkills.slice(0, 2).map(skill => `
                                            <span class="skill-tag wanted">${skill.title}</span>
                                        `).join('') : 
                                        '<span class="skill-tag">None</span>'
                                    }
                                    ${user.learningSkills.length > 2 ? `<span class="skill-tag">+${user.learningSkills.length - 2}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rating-section">
                        <span class="stars">${generateStars(user.rating || 4.0)}</span>
                        <span>${(user.rating || 4.0).toFixed(1)}/5</span>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button class="btn btn-primary" onclick="openRequestModal('${user.id}')">
                        Request
                    </button>
                </div>
            </div>
        `).join('');

        renderPagination();
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        const pageNumbers = document.getElementById('pageNumbers');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';

        // Generate page numbers
        let pagesHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            pagesHTML += `<span class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</span>`;
        }
        pageNumbers.innerHTML = pagesHTML;

        // Update navigation buttons
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;

        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderUsers();
            }
        };

        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderUsers();
            }
        };
    }

    // Global functions for onclick handlers
    window.goToPage = function(page) {
        currentPage = page;
        renderUsers();
    };

    window.openRequestModal = function(userId) {
        if (!currentUser) {
            showNotification('Please login to send requests', 'error');
            return;
        }

        selectedUser = allUsers.find(user => user.id === userId);
        if (!selectedUser) return;

        // Populate skill dropdowns
        const mySkillSelect = document.getElementById('mySkillSelect');
        const theirSkillSelect = document.getElementById('theirSkillSelect');
        const requestMessage = document.getElementById('requestMessage');

        // Get current user's skills
        const skills = getFromLocalStorage('skills') || [];
        const mySkills = skills.filter(skill => skill.userId === currentUser.id && skill.type === 'teach');

        mySkillSelect.innerHTML = '<option value="">Select your skill...</option>' +
            mySkills.map(skill => `<option value="${skill.id}">${skill.title}</option>`).join('');

        theirSkillSelect.innerHTML = '<option value="">Select their skill...</option>' +
            selectedUser.learningSkills.map(skill => `<option value="${skill.id}">${skill.title}</option>`).join('');

        requestMessage.value = `Hi ${selectedUser.username}, I'd like to exchange skills with you!`;

        requestModal.style.display = 'block';
    };

    function closeRequestModal() {
        requestModal.style.display = 'none';
        selectedUser = null;
    }

    function handleSubmitRequest() {
        const mySkillId = document.getElementById('mySkillSelect').value;
        const theirSkillId = document.getElementById('theirSkillSelect').value;
        const message = document.getElementById('requestMessage').value.trim();

        if (!mySkillId || !theirSkillId || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        // Create request
        const requests = getFromLocalStorage('requests') || [];
        const newRequest = {
            id: generateId(),
            fromUserId: currentUser.id,
            fromUserName: currentUser.username,
            toUserId: selectedUser.id,
            toUserName: selectedUser.username,
            mySkillId: mySkillId,
            theirSkillId: theirSkillId,
            message: message,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        requests.push(newRequest);
        
        if (saveToLocalStorage('requests', requests)) {
            showNotification(`Request sent to ${selectedUser.username} successfully!`, 'success');
            closeRequestModal();
        } else {
            showNotification('Failed to send request. Please try again.', 'error');
        }
    }
});