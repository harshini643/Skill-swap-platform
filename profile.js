// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'auth.html';
        return;
    }

    const profileForm = document.getElementById('profileForm');
    const photoInput = document.getElementById('photoInput');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const profilePhoto = document.getElementById('profilePhoto');
    const saveTab = document.getElementById('saveTab');
    const discardTab = document.getElementById('discardTab');
    const addOfferedSkill = document.getElementById('addOfferedSkill');
    const addWantedSkill = document.getElementById('addWantedSkill');

    let currentUser = getCurrentUser();
    let originalData = {};
    let offeredSkills = [];
    let wantedSkills = [];

    // Initialize
    updateNavigation();
    loadProfileData();

    // Photo upload
    changePhotoBtn.addEventListener('click', () => {
        photoInput.click();
    });

    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showNotification('Image size should be less than 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = e.target.result;
                profilePhoto.src = imageData;
                currentUser.profileImage = imageData;
            };
            reader.readAsDataURL(file);
        }
    });

    // Save profile
    saveTab.addEventListener('click', function() {
        const formData = new FormData(profileForm);
        const updatedData = {
            username: formData.get('userName').trim(),
            location: formData.get('location').trim(),
            availability: formData.get('availability'),
            profileVisibility: formData.get('profileVisibility')
        };

        // Update user data
        Object.assign(currentUser, updatedData);
        
        if (updateUserInStorage()) {
            // Update skills
            updateUserSkills();
            showNotification('Profile updated successfully!', 'success');
            originalData = { ...currentUser };
            updateNavigation();
        } else {
            showNotification('Failed to update profile. Please try again.', 'error');
        }
    });

    // Discard changes
    discardTab.addEventListener('click', function() {
        loadProfileData();
        showNotification('Changes discarded', 'success');
    });

    // Add skills
    addOfferedSkill.addEventListener('click', function() {
        const skillName = prompt('Enter skill name:');
        if (skillName && skillName.trim()) {
            addSkillTag('skillsOffered', skillName.trim(), 'offered');
        }
    });

    addWantedSkill.addEventListener('click', function() {
        const skillName = prompt('Enter skill name:');
        if (skillName && skillName.trim()) {
            addSkillTag('skillsWanted', skillName.trim(), 'wanted');
        }
    });

    function loadProfileData() {
        currentUser = getCurrentUser();
        originalData = { ...currentUser };

        // Populate form fields
        document.getElementById('userName').value = currentUser.username || '';
        document.getElementById('location').value = currentUser.location || '';
        document.getElementById('availability').value = currentUser.availability || 'weekends';
        document.getElementById('profileVisibility').value = currentUser.profileVisibility || 'public';

        // Update profile image
        if (currentUser.profileImage) {
            profilePhoto.src = currentUser.profileImage;
        }

        // Load skills
        loadUserSkills();
    }

    function loadUserSkills() {
        const skills = getFromLocalStorage('skills') || [];
        const userSkills = skills.filter(skill => skill.userId === currentUser.id);
        
        offeredSkills = userSkills.filter(skill => skill.type === 'teach');
        wantedSkills = userSkills.filter(skill => skill.type === 'learn');

        renderSkills();
    }

    function renderSkills() {
        const skillsOfferedContainer = document.getElementById('skillsOffered');
        const skillsWantedContainer = document.getElementById('skillsWanted');

        skillsOfferedContainer.innerHTML = offeredSkills.map(skill => 
            `<span class="skill-tag offered" onclick="removeSkill('${skill.id}')">${skill.title} ×</span>`
        ).join('');

        skillsWantedContainer.innerHTML = wantedSkills.map(skill => 
            `<span class="skill-tag wanted" onclick="removeSkill('${skill.id}')">${skill.title} ×</span>`
        ).join('');
    }

    function addSkillTag(containerId, skillName, type) {
        const newSkill = {
            id: generateId(),
            userId: currentUser.id,
            userName: currentUser.username,
            type: type === 'offered' ? 'teach' : 'learn',
            category: 'other',
            title: skillName,
            description: skillName,
            level: 'intermediate',
            duration: 'flexible',
            createdAt: new Date().toISOString()
        };

        if (type === 'offered') {
            offeredSkills.push(newSkill);
        } else {
            wantedSkills.push(newSkill);
        }

        renderSkills();
    }

    function updateUserSkills() {
        const allSkills = getFromLocalStorage('skills') || [];
        
        // Remove current user's skills
        const otherSkills = allSkills.filter(skill => skill.userId !== currentUser.id);
        
        // Add updated skills
        const updatedSkills = [...otherSkills, ...offeredSkills, ...wantedSkills];
        
        saveToLocalStorage('skills', updatedSkills);
    }

    function updateUserInStorage() {
        try {
            // Update current user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update user in users array
            const users = getFromLocalStorage('users') || [];
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex !== -1) {
                users[userIndex] = { ...currentUser };
                return saveToLocalStorage('users', users);
            }
            
            return false;
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    }

    // Global function for removing skills
    window.removeSkill = function(skillId) {
        offeredSkills = offeredSkills.filter(skill => skill.id !== skillId);
        wantedSkills = wantedSkills.filter(skill => skill.id !== skillId);
        renderSkills();
    };
});