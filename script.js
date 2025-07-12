// Enhanced Skill Swap Platform with Complete Auth and Profile System

// Global state
let currentUser = null;
let allUsers = [];
let allRequests = [];
let currentPage = 1;
let usersPerPage = 3;
let selectedUser = null;
let filteredUsers = [];
let originalProfileData = {};

// Initialize sample data
function initializeSampleData() {
    // Sample users
    const sampleUsers = [
        {
            id: 1,
            username: 'marc_demo',
            email: 'marc@demo.com',
            password: 'password123',
            name: 'Marc Demo',
            location: 'San Francisco',
            profileImage: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            skillsOffered: ['Graphic Design', 'UI/UX', 'Photoshop'],
            skillsWanted: ['Photography', 'Video Editing', 'Web Development'],
            availability: 'evenings',
            profileVisibility: 'public',
            rating: 4.2,
            ratingCount: 15,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            username: 'michell_j',
            email: 'michell@demo.com',
            password: 'password123',
            name: 'Michell Johnson',
            location: 'Chicago',
            profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            skillsOffered: ['Guitar', 'Music Production', 'Piano'],
            skillsWanted: ['Singing', 'Violin', 'Music Theory'],
            availability: 'flexible',
            profileVisibility: 'public',
            rating: 4.8,
            ratingCount: 22,
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            username: 'joe_willis',
            email: 'joe@demo.com',
            password: 'password123',
            name: 'Joe Willis',
            location: 'Austin',
            profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            skillsOffered: ['Cooking', 'Photography', 'Baking'],
            skillsWanted: ['Web Development', 'Digital Marketing', 'SEO'],
            availability: 'weekends',
            profileVisibility: 'public',
            rating: 4.5,
            ratingCount: 18,
            createdAt: new Date().toISOString()
        },
        {
            id: 4,
            username: 'sarah_chen',
            email: 'sarah@demo.com',
            password: 'password123',
            name: 'Sarah Chen',
            location: 'Seattle',
            profileImage: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            skillsOffered: ['Data Science', 'Machine Learning', 'Python'],
            skillsWanted: ['Public Speaking', 'Leadership', 'Project Management'],
            availability: 'weekdays',
            profileVisibility: 'public',
            rating: 4.9,
            ratingCount: 31,
            createdAt: new Date().toISOString()
        },
        {
            id: 5,
            username: 'alex_rodriguez',
            email: 'alex@demo.com',
            password: 'password123',
            name: 'Alex Rodriguez',
            location: 'Miami',
            profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            skillsOffered: ['Spanish Language', 'Salsa Dancing', 'Translation'],
            skillsWanted: ['Video Editing', 'Social Media', 'Content Creation'],
            availability: 'evenings',
            profileVisibility: 'public',
            rating: 4.6,
            ratingCount: 12,
            createdAt: new Date().toISOString()
        }
    ];

    // Sample requests
    const sampleRequests = [
        {
            id: 1,
            fromUserId: 2,
            fromUserName: 'Michell Johnson',
            toUserId: 1,
            offeredSkill: 'Guitar',
            wantedSkill: 'Graphic Design',
            message: 'Hi Marc! I would love to learn graphic design from you in exchange for guitar lessons.',
            status: 'pending',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            fromUserId: 3,
            fromUserName: 'Joe Willis',
            toUserId: 1,
            offeredSkill: 'Photography',
            wantedSkill: 'UI/UX',
            message: 'Hey Marc! Want to exchange photography skills for UI/UX knowledge?',
            status: 'pending',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    // Save to localStorage if not exists
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(sampleUsers));
    }
    if (!localStorage.getItem('requests')) {
        localStorage.setItem('requests', JSON.stringify(sampleRequests));
    }

    // Load data
    allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
}

// Authentication functions
function isAuthenticated() {
    return currentUser !== null;
}

function getCurrentUser() {
    if (!currentUser) {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            currentUser = JSON.parse(userData);
        }
    }
    return currentUser;
}

function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    return false;
}

function signup(userData) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
        return { success: false, message: 'Email already exists' };
    }
    
    // Check if username already exists
    if (users.find(u => u.username === userData.username)) {
        return { success: false, message: 'Username already exists' };
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        ...userData,
        skillsOffered: [],
        skillsWanted: [],
        availability: 'weekends',
        profileVisibility: 'public',
        rating: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    allUsers = users;
    
    return { success: true, user: newUser };
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateNavigation();
    renderUsers();
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeSampleData();
    
    // Check if user is logged in
    getCurrentUser();
    
    showMainContent();
    updateNavigation();
    setupEventListeners();
    renderUsers();
});

function showMainContent() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.style.display = 'block';
    }
}

function setupEventListeners() {
    // Search and filter
    const searchInput = document.getElementById('searchInput');
    const availabilityFilter = document.getElementById('availabilityFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
    }
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', filterUsers);
    }

    // Profile dropdown
    const profileTrigger = document.getElementById('profileTrigger');
    if (profileTrigger) {
        profileTrigger.addEventListener('click', toggleProfileDropdown);
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Auth form submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfile();
        });
    }

    // Photo upload
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }
}

function updateNavigation() {
    const loginButton = document.querySelector('.login-btn');
    const userSection = document.querySelector('.user-profile-section');
    
    if (isAuthenticated()) {
        if (loginButton) loginButton.style.display = 'none';
        if (userSection) userSection.style.display = 'block';
        
        // Update profile images
        const profileImages = ['navProfileImage', 'navProfilePic'];
        profileImages.forEach(id => {
            const img = document.getElementById(id);
            if (img && currentUser.profileImage) {
                img.src = currentUser.profileImage;
            }
        });
    } else {
        if (loginButton) loginButton.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
    }
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('active');
}

// Auth handlers
function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (login(email, password)) {
        showNotification('Login successful!', 'success');
        hideAuthModal();
        updateNavigation();
        renderUsers();
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
        location: formData.get('location') || ''
    };
    
    const result = signup(userData);
    if (result.success) {
        currentUser = result.user;
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        showNotification('Account created successfully!', 'success');
        hideAuthModal();
        updateNavigation();
        renderUsers();
    } else {
        showNotification(result.message, 'error');
    }
}

// User management functions
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedAvailability = document.getElementById('availabilityFilter').value;

    filteredUsers = allUsers.filter(user => {
        // Don't show current user in the list
        if (currentUser && user.id === currentUser.id) return false;
        
        // Check profile visibility
        if (user.profileVisibility === 'private') {
            // Only show private profiles if current user has accepted request with them
            if (!currentUser) return false;
            
            const hasAcceptedRequest = allRequests.some(request => 
                ((request.fromUserId === currentUser.id && request.toUserId === user.id) ||
                 (request.fromUserId === user.id && request.toUserId === currentUser.id)) &&
                request.status === 'accepted'
            );
            
            if (!hasAcceptedRequest) return false;
        }
        
        const nameMatch = user.name.toLowerCase().includes(searchTerm);
        const skillMatch = [...(user.skillsOffered || []), ...(user.skillsWanted || [])]
            .some(skill => skill.toLowerCase().includes(searchTerm));
        const searchMatch = !searchTerm || nameMatch || skillMatch;
        
        const availabilityMatch = !selectedAvailability || user.availability === selectedAvailability;
        
        return searchMatch && availabilityMatch;
    });

    currentPage = 1;
    renderUsers();
}

function renderUsers() {
    const container = document.getElementById('profilesContainer');
    if (!container) return;

    if (!filteredUsers.length) {
        filteredUsers = allUsers.filter(user => {
            if (!currentUser || user.id === currentUser.id) return false;
            
            // Check profile visibility
            if (user.profileVisibility === 'private') {
                const hasAcceptedRequest = allRequests.some(request => 
                    ((request.fromUserId === currentUser.id && request.toUserId === user.id) ||
                     (request.fromUserId === user.id && request.toUserId === currentUser.id)) &&
                    request.status === 'accepted'
                );
                return hasAcceptedRequest;
            }
            
            return true;
        });
    }

    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);

    if (usersToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No users found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    container.innerHTML = usersToShow.map(user => `
        // Check request status with this user
        let requestStatus = null;
        let buttonText = 'Request';
        let buttonClass = 'btn-primary';
        
        if (currentUser) {
            const sentRequest = allRequests.find(req => 
                req.fromUserId === currentUser.id && req.toUserId === user.id
            );
            
            if (sentRequest) {
                if (sentRequest.status === 'pending') {
                    requestStatus = 'pending';
                    buttonText = 'Requested';
                    buttonClass = 'btn-warning';
                } else if (sentRequest.status === 'accepted') {
                    requestStatus = 'accepted';
                    buttonText = 'Friends';
                    buttonClass = 'btn-success';
                } else if (sentRequest.status === 'rejected') {
                    requestStatus = 'rejected';
                    buttonText = 'Rejected';
                    buttonClass = 'btn-danger';
                }
            }
        }
        
        <div class="profile-card">
            <img src="${user.profileImage || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=90&h=90&fit=crop'}" 
                 alt="${user.name}" class="profile-photo" onclick="openUserProfile(${user.id})">
            
            <div class="profile-info">
                <h3 class="profile-name" onclick="openUserProfile(${user.id})">${user.name}</h3>
                
                <div class="skills-section">
                    <div class="skills-row">
                        <div class="skills-group">
                            <div class="skills-label">Skills Offered</div>
                            <div class="skills-tags">
                                ${(user.skillsOffered || []).length > 0 ? 
                                    user.skillsOffered.slice(0, 2).map(skill => `
                                        <span class="skill-tag offered">${skill}</span>
                                    `).join('') : 
                                    '<span class="skill-tag">None</span>'
                                }
                                ${user.skillsOffered && user.skillsOffered.length > 2 ? `<span class="skill-tag">+${user.skillsOffered.length - 2}</span>` : ''}
                            </div>
                        </div>
                        
                        <div class="skills-group">
                            <div class="skills-label">Skills Wanted</div>
                            <div class="skills-tags">
                                ${(user.skillsWanted || []).length > 0 ? 
                                    user.skillsWanted.slice(0, 2).map(skill => `
                                        <span class="skill-tag wanted">${skill}</span>
                                    `).join('') : 
                                    '<span class="skill-tag">None</span>'
                                }
                                ${user.skillsWanted && user.skillsWanted.length > 2 ? `<span class="skill-tag">+${user.skillsWanted.length - 2}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="rating-section">
                    <span class="stars">${generateStars(user.rating || 0)}</span>
                    <span>${(user.rating || 0).toFixed(1)}/5 (${user.ratingCount || 0} reviews)</span>
                </div>
            </div>
            
            <div class="profile-actions">
                <button class="btn btn-primary" onclick="openRequestModal(${user.id})">
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

    if (!pageNumbers || totalPages <= 1) {
        const pagination = document.getElementById('pagination');
        if (pagination) pagination.style.display = 'none';
        return;
    }

    document.getElementById('pagination').style.display = 'flex';

    // Generate page numbers
    let pagesHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        pagesHTML += `<span class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</span>`;
    }
    pageNumbers.innerHTML = pagesHTML;

    // Update navigation buttons
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderUsers();
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderUsers();
            }
        };
    }
}

function goToPage(page) {
    currentPage = page;
    renderUsers();
}

// Auth modal functions
function showAuthModal() {
    document.getElementById('authModal').style.display = 'block';
    showLoginForm();
}

function hideAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function showLoginForm() {
    document.getElementById('loginFormContainer').style.display = 'block';
    document.getElementById('signupFormContainer').style.display = 'none';
    document.getElementById('authTitle').textContent = 'Login to Your Account';
}

function showSignupForm() {
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('signupFormContainer').style.display = 'block';
    document.getElementById('authTitle').textContent = 'Create New Account';
}

// Request functions
function openRequestModal(userId) {
    if (!isAuthenticated()) {
        showNotification('Please login to send requests', 'error');
        showAuthModal();
        return;
    }

    selectedUser = allUsers.find(user => user.id === userId);
    if (!selectedUser) return;

    // Populate skill dropdowns
    const mySkillSelect = document.getElementById('mySkillSelect');
    const theirSkillSelect = document.getElementById('theirSkillSelect');
    const requestMessage = document.getElementById('requestMessage');

    mySkillSelect.innerHTML = '<option value="">Select your skill...</option>' +
        (currentUser.skillsOffered || []).map(skill => `<option value="${skill}">${skill}</option>`).join('');

    theirSkillSelect.innerHTML = '<option value="">Select their skill...</option>' +
        (selectedUser.skillsWanted || []).map(skill => `<option value="${skill}">${skill}</option>`).join('');

    requestMessage.value = `Hi ${selectedUser.name}, I'd like to exchange skills with you!`;

    document.getElementById('requestModal').style.display = 'block';
}

function hideRequestModal() {
    document.getElementById('requestModal').style.display = 'none';
    selectedUser = null;
}

function submitRequest() {
    const mySkill = document.getElementById('mySkillSelect').value;
    const theirSkill = document.getElementById('theirSkillSelect').value;
    const message = document.getElementById('requestMessage').value.trim();

    if (!mySkill || !theirSkill || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Create new request
    const newRequest = {
        id: Date.now(),
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        toUserId: selectedUser.id,
        toUserName: selectedUser.name,
        offeredSkill: mySkill,
        wantedSkill: theirSkill,
        message: message,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    allRequests.push(newRequest);
    localStorage.setItem('requests', JSON.stringify(allRequests));
    
    showNotification(`Request sent to ${selectedUser.name} successfully!`, 'success');
    hideRequestModal();
}

// Profile functions
function showProfile() {
    if (!isAuthenticated()) {
        showNotification('Please login to view profile', 'error');
        showAuthModal();
        return;
    }
    
    loadProfileData();
    document.getElementById('profileModal').style.display = 'block';
    showProfileTab('edit');
}

function hideProfile() {
    document.getElementById('profileModal').style.display = 'none';
}

function showProfileTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.profile-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.profile-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).style.display = 'block';
    
    // Add active class to clicked button
    document.querySelector(`[onclick="showProfileTab('${tabName}')"]`).classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'sent') {
        loadSentRequests();
    } else if (tabName === 'received') {
        loadReceivedRequests();
    }
}

function loadProfileData() {
    if (!currentUser) return;
    
    // Store original data for discard functionality
    originalProfileData = { ...currentUser };

    // Populate form fields
    document.getElementById('userName').value = currentUser.name || '';
    document.getElementById('userEmail').value = currentUser.email || '';
    document.getElementById('userLocation').value = currentUser.location || '';
    document.getElementById('availability').value = currentUser.availability || 'weekends';
    document.getElementById('profileVisibility').value = currentUser.profileVisibility || 'public';

    // Update profile image
    const profilePhoto = document.getElementById('profilePhoto');
    if (currentUser.profileImage && profilePhoto) {
        profilePhoto.src = currentUser.profileImage;
    }

    // Load skills
    renderProfileSkills();
}

function renderProfileSkills() {
    const skillsOfferedContainer = document.getElementById('skillsOffered');
    const skillsWantedContainer = document.getElementById('skillsWanted');

    if (skillsOfferedContainer) {
        skillsOfferedContainer.innerHTML = (currentUser.skillsOffered || []).map(skill => 
            `<span class="skill-tag offered removable" onclick="removeSkill('offered', '${skill}')">${skill} ×</span>`
        ).join('');
    }

    if (skillsWantedContainer) {
        skillsWantedContainer.innerHTML = (currentUser.skillsWanted || []).map(skill => 
            `<span class="skill-tag wanted removable" onclick="removeSkill('wanted', '${skill}')">${skill} ×</span>`
        ).join('');
    }
}

function addSkill(type) {
    const containerId = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    const container = document.getElementById(containerId);
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'skill-input';
    input.placeholder = 'Enter skill name...';
    input.style.cssText = `
        background: white;
        border: 2px solid #1e3a8a;
        border-radius: 20px;
        padding: 0.375rem 0.875rem;
        font-size: 0.8rem;
        outline: none;
        margin: 0.25rem;
    `;
    
    container.appendChild(input);
    input.focus();
    
    // Handle input completion
    function completeInput() {
        const skillName = input.value.trim();
        container.removeChild(input);
        
        if (skillName) {
            if (type === 'offered') {
                currentUser.skillsOffered = currentUser.skillsOffered || [];
                if (!currentUser.skillsOffered.includes(skillName)) {
                    currentUser.skillsOffered.push(skillName);
                }
            } else {
                currentUser.skillsWanted = currentUser.skillsWanted || [];
                if (!currentUser.skillsWanted.includes(skillName)) {
                    currentUser.skillsWanted.push(skillName);
                }
            }
            renderProfileSkills();
        }
    }
    
    // Complete on Enter or blur
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            completeInput();
        }
    });
    
    input.addEventListener('blur', completeInput);
}

function removeSkill(type, skillName) {
    if (type === 'offered') {
        currentUser.skillsOffered = currentUser.skillsOffered.filter(skill => skill !== skillName);
    } else {
        currentUser.skillsWanted = currentUser.skillsWanted.filter(skill => skill !== skillName);
    }
    renderProfileSkills();
}

function saveProfile() {
    const formData = new FormData(document.getElementById('profileForm'));
    
    // Update current user data
    currentUser.name = formData.get('userName').trim();
    currentUser.email = formData.get('userEmail').trim();
    currentUser.location = formData.get('userLocation').trim();
    currentUser.availability = formData.get('availability');
    currentUser.profileVisibility = formData.get('profileVisibility');

    // Update in localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = { ...currentUser };
        localStorage.setItem('users', JSON.stringify(users));
        allUsers = users;
    }

    // Update original data
    originalProfileData = { ...currentUser };

    showNotification('Profile updated successfully!', 'success');
    updateNavigation();
    renderUsers();
    hideProfile(); // Close profile modal and go to homepage
}

function discardProfile() {
    // Restore original data
    currentUser = { ...originalProfileData };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showNotification('Changes discarded', 'success');
    hideProfile(); // Close profile modal and go to homepage
}

function changePhoto() {
    document.getElementById('photoInput').click();
}

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showNotification('Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            document.getElementById('profilePhoto').src = imageData;
            currentUser.profileImage = imageData;
            updateNavigation(); // Update nav profile image
        };
        reader.readAsDataURL(file);
    }
}

// Request management
function loadSentRequests() {
    const sentRequests = allRequests.filter(request => request.fromUserId === currentUser.id);
    renderRequestsList(sentRequests, 'sentRequestsList', 'sent');
}

function loadReceivedRequests() {
    const receivedRequests = allRequests.filter(request => request.toUserId === currentUser.id);
    renderRequestsList(receivedRequests, 'receivedRequestsList', 'received');
}

function renderRequestsList(requests, containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No ${type} requests</h3>
                <p>No skill exchange requests found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = requests.map(request => {
        const otherUser = allUsers.find(u => u.id === (type === 'sent' ? request.toUserId : request.fromUserId));
        const canRate = type === 'sent' && request.status === 'accepted';
        
        return `
            <div class="request-item">
                <img src="${otherUser?.profileImage || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop'}" 
                     alt="${type === 'sent' ? request.toUserName : request.fromUserName}" class="request-photo">
                
                <div class="request-info">
                    <h3 class="request-name">${type === 'sent' ? request.toUserName : request.fromUserName}</h3>
                    
                    <div class="request-skills">
                        <div class="request-skill-group">
                            <div class="request-skill-label">Offered Skill</div>
                            <span class="skill-tag offered">${request.offeredSkill}</span>
                        </div>
                        
                        <div class="request-skill-group">
                            <div class="request-skill-label">Wanted Skill</div>
                            <span class="skill-tag wanted">${request.wantedSkill}</span>
                        </div>
                    </div>
                    
                    <div class="request-message">
                        <strong>Message:</strong> ${request.message}
                    </div>
                    
                    <div class="request-date">
                        ${new Date(request.createdAt).toLocaleDateString()}
                    </div>
                </div>
                
                <div class="request-status">
                    <span class="status-badge status-${request.status}">${request.status}</span>
                    
                    ${type === 'received' && request.status === 'pending' ? `
                        <div class="request-actions">
                            <button class="btn-accept" onclick="handleRequest(${request.id}, 'accepted')">
                                Accept
                            </button>
                            <button class="btn-reject" onclick="handleRequest(${request.id}, 'rejected')">
                                Reject
                            </button>
                        </div>
                    ` : ''}
                    
                    ${canRate ? `
                        <button class="btn btn-secondary" onclick="openRatingModal(${otherUser.id}, ${request.id})">
                            Rate User
                    <button class="btn ${buttonClass}" onclick="openRequestModal(${user.id})" ${buttonDisabled}>
                        ${buttonText}
                </div>
            </div>
        `;
    }).join('');
}

function handleRequest(requestId, action) {
    const requestIndex = allRequests.findIndex(req => req.id === requestId);
    
    if (requestIndex === -1) {
        showNotification('Request not found', 'error');
        return;
    }

    allRequests[requestIndex].status = action;
    allRequests[requestIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem('requests', JSON.stringify(allRequests));
    
    const actionText = action === 'accepted' ? 'accepted' : 'rejected';
    showNotification(`Request ${actionText} successfully!`, 'success');
    loadReceivedRequests();
}

// User profile modal
function openUserProfile(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    selectedUser = user;
    
    // Populate user profile modal
    document.getElementById('userProfileName').textContent = user.name;
    document.getElementById('userProfileImage').src = user.profileImage || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop';
    document.getElementById('userProfileLocation').textContent = user.location || 'Location not specified';
    document.getElementById('userProfileAvailability').textContent = user.availability || 'Not specified';
    
    // Skills
    const offeredSkillsContainer = document.getElementById('userProfileOfferedSkills');
    const wantedSkillsContainer = document.getElementById('userProfileWantedSkills');
    
    offeredSkillsContainer.innerHTML = (user.skillsOffered || []).map(skill => 
        `<span class="skill-tag offered">${skill}</span>`
    ).join('') || '<span class="skill-tag">No skills offered</span>';
    
    wantedSkillsContainer.innerHTML = (user.skillsWanted || []).map(skill => 
        `<span class="skill-tag wanted">${skill}</span>`
    ).join('') || '<span class="skill-tag">No skills wanted</span>';
    
    // Rating
    document.getElementById('userProfileRating').innerHTML = `
        ${generateStars(user.rating || 0)} ${(user.rating || 0).toFixed(1)}/5 (${user.ratingCount || 0} reviews)
    `;
    
    // Show/hide rate button
    const rateButton = document.getElementById('rateUserButton');
    const canRate = isAuthenticated() && hasAcceptedRequest(userId);
    if (rateButton) {
        rateButton.style.display = canRate ? 'block' : 'none';
        rateButton.onclick = () => openRatingModal(userId);
    }
    
    document.getElementById('userProfileModal').style.display = 'block';
}

function hideUserProfile() {
    document.getElementById('userProfileModal').style.display = 'none';
    selectedUser = null;
}

function hasAcceptedRequest(userId) {
    return allRequests.some(request => 
        request.fromUserId === currentUser.id && 
        request.toUserId === userId && 
        request.status === 'accepted'
    );
}

// Rating system
function openRatingModal(userId, requestId = null) {
    selectedUser = allUsers.find(u => u.id === userId);
    if (!selectedUser) return;
    
    document.getElementById('ratingUserName').textContent = selectedUser.name;
    document.getElementById('ratingModal').style.display = 'block';
}

function hideRatingModal() {
    document.getElementById('ratingModal').style.display = 'none';
    selectedUser = null;
}

function setRating(rating) {
    // Update visual feedback
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
    
    // Store rating
    document.getElementById('ratingModal').dataset.rating = rating;
}

function submitRating() {
    const rating = parseInt(document.getElementById('ratingModal').dataset.rating || '0');
    const comment = document.getElementById('ratingComment').value.trim();
    
    if (rating === 0) {
        showNotification('Please select a rating', 'error');
        return;
    }
    
    // Update user rating
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === selectedUser.id);
    
    if (userIndex !== -1) {
        const user = users[userIndex];
        const currentTotal = (user.rating || 0) * (user.ratingCount || 0);
        const newCount = (user.ratingCount || 0) + 1;
        const newRating = (currentTotal + rating) / newCount;
        
        users[userIndex].rating = newRating;
        users[userIndex].ratingCount = newCount;
        
        localStorage.setItem('users', JSON.stringify(users));
        allUsers = users;
        
        showNotification('Rating submitted successfully!', 'success');
        hideRatingModal();
        hideUserProfile();
        renderUsers();
    }
}

// Utility functions
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    
    // Half star
    if (hasHalfStar) {
        stars += '☆';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    
    return stars;
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Global functions for onclick handlers
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.showLoginForm = showLoginForm;
window.showSignupForm = showSignupForm;
window.logout = logout;
window.goToPage = goToPage;
window.openRequestModal = openRequestModal;
window.hideRequestModal = hideRequestModal;
window.submitRequest = submitRequest;
window.showProfile = showProfile;
window.hideProfile = hideProfile;
window.showProfileTab = showProfileTab;
window.addSkill = addSkill;
window.removeSkill = removeSkill;
window.saveProfile = saveProfile;
window.discardProfile = discardProfile;
window.changePhoto = changePhoto;
window.handleRequest = handleRequest;
window.openUserProfile = openUserProfile;
window.hideUserProfile = hideUserProfile;
window.openRatingModal = openRatingModal;
window.hideRatingModal = hideRatingModal;
window.setRating = setRating;
window.submitRating = submitRating;