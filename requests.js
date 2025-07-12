// Requests page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'auth.html';
        return;
    }

    const requestsList = document.getElementById('requestsList');
    const statusFilter = document.getElementById('statusFilter');
    const requestsSearch = document.getElementById('requestsSearch');

    let currentUser = getCurrentUser();
    let allRequests = [];
    let filteredRequests = [];

    // Initialize
    updateNavigation();
    loadRequests();

    // Search and filter functionality
    if (statusFilter) {
        statusFilter.addEventListener('change', filterRequests);
    }
    if (requestsSearch) {
        requestsSearch.addEventListener('input', filterRequests);
    }

    function loadRequests() {
        const requests = getFromLocalStorage('requests') || [];
        const users = getFromLocalStorage('users') || [];
        const skills = getFromLocalStorage('skills') || [];
        
        // Get requests where current user is the recipient
        allRequests = requests
            .filter(request => request.toUserId === currentUser.id)
            .map(request => {
                const fromUser = users.find(u => u.id === request.fromUserId);
                const mySkill = skills.find(s => s.id === request.theirSkillId);
                const theirSkill = skills.find(s => s.id === request.mySkillId);
                
                return {
                    ...request,
                    fromUser,
                    mySkill,
                    theirSkill
                };
            });

        filteredRequests = [...allRequests];
        renderRequests();
    }

    function filterRequests() {
        const searchTerm = requestsSearch ? requestsSearch.value.toLowerCase() : '';
        const selectedStatus = statusFilter ? statusFilter.value : '';

        filteredRequests = allRequests.filter(request => {
            const nameMatch = request.fromUserName.toLowerCase().includes(searchTerm);
            const skillMatch = (request.mySkill?.title || '').toLowerCase().includes(searchTerm) ||
                              (request.theirSkill?.title || '').toLowerCase().includes(searchTerm);
            const searchMatch = !searchTerm || nameMatch || skillMatch;
            
            const statusMatch = !selectedStatus || request.status === selectedStatus;
            
            return searchMatch && statusMatch;
        });

        renderRequests();
    }

    function renderRequests() {
        if (filteredRequests.length === 0) {
            requestsList.innerHTML = `
                <div class="empty-state">
                    <h3>No requests found</h3>
                    <p>No skill exchange requests at the moment</p>
                </div>
            `;
            return;
        }

        requestsList.innerHTML = filteredRequests.map(request => `
            <div class="request-item">
                <img src="${request.fromUser?.profileImage || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop'}" 
                     alt="${request.fromUserName}" class="request-photo">
                
                <div class="request-info">
                    <h3 class="request-name">${request.fromUserName}</h3>
                    
                    <div class="request-skills">
                        <div class="request-skill-group">
                            <div class="request-skill-label">Skills Offered</div>
                            <span class="skill-tag offered">${request.theirSkill?.title || 'Unknown'}</span>
                        </div>
                        
                        <div class="request-skill-group">
                            <div class="request-skill-label">Skills Wanted</div>
                            <span class="skill-tag wanted">${request.mySkill?.title || 'Unknown'}</span>
                        </div>
                    </div>
                    
                    <div class="request-rating">
                        Rating: ${generateStars(request.fromUser?.rating || 4.0)} ${(request.fromUser?.rating || 4.0).toFixed(1)}/5
                    </div>
                </div>
                
                <div class="request-status">
                    <span class="status-badge status-${request.status}">${request.status}</span>
                    
                    ${request.status === 'pending' ? `
                        <div class="request-actions">
                            <button class="btn-accept" onclick="handleRequest('${request.id}', 'accepted')">
                                Accept
                            </button>
                            <button class="btn-reject" onclick="handleRequest('${request.id}', 'rejected')">
                                Reject
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Global function for handling requests
    window.handleRequest = function(requestId, action) {
        const requests = getFromLocalStorage('requests') || [];
        const requestIndex = requests.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
            showNotification('Request not found', 'error');
            return;
        }

        requests[requestIndex].status = action;
        requests[requestIndex].updatedAt = new Date().toISOString();
        
        if (saveToLocalStorage('requests', requests)) {
            const actionText = action === 'accepted' ? 'accepted' : 'rejected';
            showNotification(`Request ${actionText} successfully!`, 'success');
            loadRequests();
        } else {
            showNotification('Failed to update request. Please try again.', 'error');
        }
    };
});