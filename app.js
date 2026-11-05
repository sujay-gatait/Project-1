// Initial Initializer & Mock Data
const initialPosts = [
    {
        id: "1",
        title: "Building Modern Web Applications with Vanilla JavaScript",
        category: "Frontend",
        excerpt: "Learn how to architect clean, scalable dynamic web interfaces using plain JS without heavy dependencies.",
        content: "<p>Vanilla JavaScript has evolved significantly. With modern APIs like DOM QuerySelectors, LocalStorage, and Fetch, building single page apps is easier than ever.</p><h3>Why go Vanilla?</h3><p>It enhances performance, reduces bundle sizes, and provides deep foundational knowledge of browser engines.</p>",
        author: "Sarah Drasner",
        date: "Oct 12, 2026",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
        views: 1240,
        likes: 85
    },
    {
        id: "2",
        title: "Mastering CSS Grid and Flexbox Layouts",
        category: "Design",
        excerpt: "A comprehensive guide on when to use CSS Grid versus Flexbox for building highly responsive user interfaces.",
        content: "<p>Layouts on the web used to rely heavily on floats and inline blocks. Flexbox and Grid have completely changed the paradigm.</p><p><strong>Flexbox:</strong> Ideal for one-dimensional layouts (rows or columns).</p><p><strong>CSS Grid:</strong> Designed for complex two-dimensional layout requirements.</p>",
        author: "Alex Turner",
        date: "Oct 18, 2026",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
        views: 890,
        likes: 62
    }
];

// State Management
let posts = JSON.parse(localStorage.getItem('devwrite_posts')) || initialPosts;
let currentUser = JSON.parse(localStorage.getItem('devwrite_user')) || null;
let selectedCategory = 'All';

// Save state back to localStorage
function savePosts() {
    localStorage.setItem('devwrite_posts', JSON.stringify(posts));
}

// Global DOM Selectors
const navMenu = document.getElementById('navMenu');
const mobileToggle = document.getElementById('mobileToggle');
const guestNav = document.getElementById('guestNav');
const userNav = document.getElementById('userNav');
const navUsername = document.getElementById('navUsername');
const logoutBtn = document.getElementById('logoutBtn');

// Navigation SPA Router
function handleRouting() {
    const hash = window.location.hash.substring(1) || 'home';
    const pages = document.querySelectorAll('.view-page');
    
    pages.forEach(page => {
        if (page.id === `page-${hash}`) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });

    // Update active navbar links
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-page') === hash) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Mobile nav auto close
    navMenu.classList.remove('show');

    // Page Specific Renders
    if (hash === 'home') renderHomePosts();
    if (hash === 'dashboard') renderDashboard();
    if (hash === 'create') resetForm();
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    handleRouting();
});

// Mobile Navbar Toggle
mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
});

// Authentication UI & Actions
function updateAuthUI() {
    if (currentUser) {
        guestNav.classList.add('hidden');
        userNav.classList.remove('hidden');
        navUsername.textContent = currentUser.name;
    } else {
        guestNav.classList.remove('hidden');
        userNav.classList.add('hidden');
    }
}

// Registration Form Handler
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    
    currentUser = { name, email };
    localStorage.setItem('devwrite_user', JSON.stringify(currentUser));
    updateAuthUI();
    showToast(`Welcome aboard, ${name}!`);
    window.location.hash = '#dashboard';
});

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const name = email.split('@')[0];
    
    currentUser = { name: name.charAt(0).toUpperCase() + name.slice(1), email };
    localStorage.setItem('devwrite_user', JSON.stringify(currentUser));
    updateAuthUI();
    showToast('Successfully logged in!');
    window.location.hash = '#dashboard';
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('devwrite_user');
    updateAuthUI();
    showToast('Logged out');
    window.location.hash = '#home';
});

// Home Page: Rendering & Filtering
function renderHomePosts() {
    const container = document.getElementById('postsContainer');
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = posts.filter(post => {
        const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchVal) || 
                              post.excerpt.toLowerCase().includes(searchVal);
        return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No articles found matching criteria.</p>`;
        return;
    }

    container.innerHTML = filtered.map(post => `
        <article class="card" onclick="openArticleModal('${post.id}')">
            <img src="${post.image}" alt="${post.title}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80'">
            <div class="card-body">
                <span class="card-badge">${post.category}</span>
                <h3 class="card-title">${post.title}</h3>
                <p class="card-excerpt">${post.excerpt}</p>
                <div class="card-footer">
                    <span class="card-author"><i class="fa-regular fa-user"></i> ${post.author}</span>
                    <span>${post.date}</span>
                </div>
            </div>
        </article>
    `).join('');
}

// Live Search Input Listener
document.getElementById('searchInput').addEventListener('input', renderHomePosts);

// Category Filter Chips Listener
document.getElementById('categoryChips').addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        selectedCategory = e.target.getAttribute('data-cat');
        renderHomePosts();
    }
});

// Reader Modal Actions
function openArticleModal(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    post.views += 1;
    savePosts();

    const articleContainer = document.getElementById('modalArticle');
    articleContainer.innerHTML = `
        <span class="card-badge">${post.category}</span>
        <h1 style="margin: 10px 0;">${post.title}</h1>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 15px;">
            By <strong>${post.author}</strong> | Published on ${post.date} | ${post.views} Views
        </p>
        <img src="${post.image}" alt="${post.title}" class="modal-hero-img" onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80'">
        <div style="line-height: 1.8; margin-top: 20px;">${post.content}</div>
    `;

    document.getElementById('postModal').classList.add('active');
}

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('postModal').classList.remove('active');
});

// Dashboard Page: Stats and Data Table
function renderDashboard() {
    if (!currentUser) {
        window.location.hash = '#login';
        return;
    }

    // Filter user specific posts (using current user author name matching or default fallback)
    const userPosts = posts.filter(p => p.author === currentUser.name || p.author === "Sarah Drasner");
    
    // Stats
    document.getElementById('statTotalPosts').textContent = userPosts.length;
    document.getElementById('statTotalViews').textContent = userPosts.reduce((acc, p) => acc + (p.views || 0), 0);
    document.getElementById('statTotalLikes').textContent = userPosts.reduce((acc, p) => acc + (p.likes || 0), 0);

    // Table Content
    const tbody = document.getElementById('dashboardTableBody');
    if (userPosts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No articles published yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = userPosts.map(post => `
        <tr>
            <td><strong>${post.title}</strong></td>
            <td><span class="card-badge">${post.category}</span></td>
            <td>${post.date}</td>
            <td><span style="color: green; font-weight: 500;">Published</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editPost('${post.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deletePost('${post.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// Create & Edit Blog Functions
const postForm = document.getElementById('postForm');
const btnWrite = document.getElementById('btnWrite');
const btnPreview = document.getElementById('btnPreview');
const postContent = document.getElementById('postContent');
const contentPreview = document.getElementById('contentPreview');

// Toggle Write/Preview Tabs
btnWrite.addEventListener('click', () => {
    btnWrite.classList.add('active');
    btnPreview.classList.remove('active');
    postContent.classList.remove('hidden');
    contentPreview.classList.add('hidden');
});

btnPreview.addEventListener('click', () => {
    btnPreview.classList.add('active');
    btnWrite.classList.remove('active');
    contentPreview.innerHTML = postContent.value || '<p style="color: var(--text-muted)">Nothing to preview.</p>';
    postContent.classList.add('hidden');
    contentPreview.classList.remove('hidden');
});

// Save Post (Create / Edit Submit)
postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser) {
        showToast('Please login to create a post');
        window.location.hash = '#login';
        return;
    }

    const id = document.getElementById('postId').value;
    const title = document.getElementById('postTitle').value;
    const category = document.getElementById('postCategory').value;
    const image = document.getElementById('postImage').value || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80';
    const excerpt = document.getElementById('postExcerpt').value;
    const content = document.getElementById('postContent').value;

    if (id) {
        // Edit Existing Post
        const index = posts.findIndex(p => p.id === id);
        if (index !== -1) {
            posts[index] = { ...posts[index], title, category, image, excerpt, content };
            showToast('Article updated successfully!');
        }
    } else {
        // Create New Post
        const newPost = {
            id: Date.now().toString(),
            title,
            category,
            excerpt,
            content,
            author: currentUser.name,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            image,
            views: 0,
            likes: 0
        };
        posts.unshift(newPost);
        showToast('Article published successfully!');
    }

    savePosts();
    resetForm();
    window.location.hash = '#dashboard';
});

// Edit Button Action Trigger
function editPost(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    document.getElementById('editorTitle').textContent = 'Edit Article';
    document.getElementById('postId').value = post.id;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postCategory').value = post.category;
    document.getElementById('postImage').value = post.image;
    document.getElementById('postExcerpt').value = post.excerpt;
    document.getElementById('postContent').value = post.content;

    window.location.hash = '#create';
}

// Delete Post Action Trigger
function deletePost(id) {
    if (confirm('Are you sure you want to delete this article?')) {
        posts = posts.filter(p => p.id !== id);
        savePosts();
        renderDashboard();
        showToast('Article deleted');
    }
}

// Form Reset Auxiliary
function resetForm() {
    document.getElementById('editorTitle').textContent = 'Write a New Story';
    postForm.reset();
    document.getElementById('postId').value = '';
    btnWrite.click();
}

document.getElementById('cancelPostBtn').addEventListener('click', () => {
    resetForm();
    window.location.hash = '#dashboard';
});

// Notification Toast Helper
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
