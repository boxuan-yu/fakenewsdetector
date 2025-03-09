// DOM Elements
const imageUploadForm = document.getElementById('imageUploadForm');
const urlForm = document.getElementById('urlForm');
const imageUpload = document.getElementById('imageUpload');
const dropZone = document.getElementById('dropZone');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImage = document.getElementById('removeImage');
const verifyImageBtn = document.getElementById('verifyImageBtn');
const verifyUrlBtn = document.getElementById('verifyUrlBtn');
const urlInput = document.getElementById('urlInput');

// Results elements
const resultsLoading = document.getElementById('resultsLoading');
const resultsContent = document.getElementById('resultsContent');
const noResults = document.getElementById('noResults');
const resultCategory = document.getElementById('resultCategory');
const resultDescription = document.getElementById('resultDescription');
const resultSources = document.getElementById('resultSources');
const matchedSources = document.getElementById('matchedSources');

// Navigation elements
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

// API endpoints - Update with proper backend URL
const API_BASE_URL = 'https://fakenewsdetectorserv.onrender.com';
const VERIFY_URL_ENDPOINT = `${API_BASE_URL}/scrape`;
const VERIFY_IMAGE_ENDPOINT = `${API_BASE_URL}/image`;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    setupDropZone();
    setupForms();
    setupNavigation();
    setupAnimations();
    setupShareButton();
});

// Navbar scroll effect
function setupNavigation() {
    // Change navbar background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Setup Intersection Observer for scroll animations
function setupAnimations() {
    const animatedElements = document.querySelectorAll('.slide-up, .fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(element);
    });
}

// Drop Zone Setup
function setupDropZone() {
    // Ensure elements exist
    if (!dropZone || !imageUpload || !removeImage || !imagePreview || !previewImg) {
        console.error('Required DOM elements for dropzone not found');
        return;
    }

    // Make sure the file input accepts images from mobile
    imageUpload.setAttribute('accept', 'image/*');

    // Visual feedback when dragging file over drop zone
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('bg-light');
        dropZone.style.transform = 'scale(1.03)';
        dropZone.style.borderColor = 'var(--harvard-crimson)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('bg-light');
        dropZone.style.transform = 'scale(1)';
        dropZone.style.borderColor = '';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('bg-light');
        dropZone.style.transform = 'scale(1)';
        dropZone.style.borderColor = '';
        
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
            const file = e.dataTransfer.files[0];
            // Only validate file type
            if (file.type.match('image.*')) {
                imageUpload.files = e.dataTransfer.files;
                updateImagePreview(file);
            } else {
                showNotification('Please select an image file (JPEG, PNG, etc.)', 'danger');
            }
        }
    });

    // Enhanced file selection handler
    imageUpload.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Only validate file type
            if (file.type.match('image.*')) {
                updateImagePreview(file);
            } else {
                showNotification('Please select an image file (JPEG, PNG, etc.)', 'danger');
                imageUpload.value = ''; // Clear the input
            }
        }
    });

    // Remove image button
    removeImage.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Add fade-out animation to preview
        imagePreview.style.opacity = '0';
        imagePreview.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            imageUpload.value = '';
            imagePreview.classList.add('d-none');
            
            // Add fade-in animation to dropzone
            dropZone.style.opacity = '0';
            dropZone.style.transform = 'scale(0.95)';
            dropZone.classList.remove('d-none');
            
            setTimeout(() => {
                dropZone.style.opacity = '1';
                dropZone.style.transform = 'scale(1)';
            }, 50);
            
            verifyImageBtn.disabled = true;
        }, 300);
    });

    // Direct click handler for drop zone
    dropZone.addEventListener('click', function() {
        imageUpload.click();
    });
}

// Image preview function
function updateImagePreview(file) {
    if (!file) return;
    
    // Show preview with animation
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        
        // Fade out drop zone
        dropZone.style.opacity = '0';
        dropZone.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            dropZone.classList.add('d-none');
            
            // Fade in image preview
            imagePreview.classList.remove('d-none');
            imagePreview.style.opacity = '0';
            imagePreview.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                imagePreview.style.opacity = '1';
                imagePreview.style.transform = 'scale(1)';
                // Enable verification button
                verifyImageBtn.disabled = false;
            }, 50);
        }, 300);
    };
    reader.readAsDataURL(file);
}

// Setup form submissions with improved feedback
function setupForms() {
    // Ensure elements exist
    if (!imageUploadForm || !urlForm) {
        console.error('Form elements not found');
        return;
    }

    // Image form submission
    imageUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate file input
        if (!imageUpload.files || !imageUpload.files[0]) {
            showNotification('Please select an image to upload', 'warning');
            return;
        }
        
        // Show loading state with animation
        showLoading();
        
        // Add button loading state
        verifyImageBtn.disabled = true;
        verifyImageBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Verifying...';
        
        // Create form data with image
        const formData = new FormData();
        formData.append('file', imageUpload.files[0]);
        
        try {
            // Send the image to the backend for verification
            const response = await fetch(VERIFY_IMAGE_ENDPOINT, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            
            const result = await response.json();
            
            // Process the result using the backend format
            displayResults(result);
            
            // Reset button state
            verifyImageBtn.disabled = false;
            verifyImageBtn.innerHTML = '<i class="bi bi-shield-check me-1"></i> Verify Image';
            
            showNotification('Image successfully verified!', 'success');
            
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error verifying image: ' + error.message, 'danger');
            hideLoading();
            
            // Reset button state
            verifyImageBtn.disabled = false;
            verifyImageBtn.innerHTML = '<i class="bi bi-shield-check me-1"></i> Verify Image';
        }
    });
    
    // URL form submission
    urlForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        if (!url) {
            showNotification('Please enter a URL', 'warning');
            urlInput.focus();
            return;
        }
        
        // Basic URL validation
        if (!isValidUrl(url)) {
            showNotification('Please enter a valid URL', 'warning');
            urlInput.focus();
            return;
        }
        
        // Show loading state
        showLoading();
        
        // Add button loading state
        verifyUrlBtn.disabled = true;
        verifyUrlBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Verifying...';
        
        try {
            // Make API call to the backend
            const response = await fetch(`${VERIFY_URL_ENDPOINT}?url=${encodeURIComponent(url)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            
            const result = await response.json();
            
            // Display the results from backend
            displayResults(result);
            
            // Reset button state
            verifyUrlBtn.disabled = false;
            verifyUrlBtn.innerHTML = '<i class="bi bi-shield-check me-1"></i> Verify URL';
            
            showNotification('URL successfully verified!', 'success');
            
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error verifying URL: ' + error.message, 'danger');
            hideLoading();
            
            // Reset button state
            verifyUrlBtn.disabled = false;
            verifyUrlBtn.innerHTML = '<i class="bi bi-shield-check me-1"></i> Verify URL';
        }
    });
}

// Display verification results with animations
function displayResults(result) {
    hideLoading();
    
    // Show results container with fade-in
    resultsContent.classList.remove('d-none');
    resultsContent.style.opacity = '0';
    
    // Hide no results message
    noResults.classList.add('d-none');
    
    setTimeout(() => {
        resultsContent.style.opacity = '1';
        
        setTimeout(() => {
            // Set category based on keyword count
            let category, categoryClass, description;
            const keywords = result.extracted_content || "";
            const sources = result.matched_sources || [];
            const sourceCount = sources.length;
            
            if (sourceCount >= 5) {
                category = "RELIABLE";
                categoryClass = "bg-success";
                description = "Content that has been verified by multiple reliable sources.";
            } else if (sourceCount >= 3) {
                category = "NEUTRAL";
                categoryClass = "bg-warning";
                description = "Content that has limited verification from other sources. Exercise caution.";
            } else {
                category = "FAKE";
                categoryClass = "bg-danger";
                description = "Content that could not be verified with any reliable sources.";
            }
            
            // Update result category display
            resultCategory.textContent = category;
            resultCategory.className = '';
            resultCategory.classList.add('result-category', categoryClass);
            
            // Update description and source count
            resultDescription.textContent = description;
            resultSources.textContent = sourceCount;
            
            // Display matched sources with staggered animation
            if (sources && sources.length > 0) {
                let sourcesHtml = '';
                sources.forEach((source, index) => {
                    const reliability = sourceCount >= 2 ? "high" : sourceCount === 1 ? "medium" : "low";
                    const reliabilityClass = getReliabilityClass(reliability);
                    const publishedDate = source.publishedAt || new Date().toISOString();
                    
                    sourcesHtml += `
                        <div class="matched-source" style="opacity: 0; transform: translateY(10px); transition: all 0.3s ease; transition-delay: ${0.1 * index}s;">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="mb-0">${source.title || source.source_name || 'Source'}</h6>
                                <span class="source-reliability ${reliabilityClass}">
                                    ${capitalizeFirstLetter(reliability)} Reliability
                                </span>
                            </div>
                            <p class="small text-muted mb-2">${source.source_name || 'Unknown'} - ${formatDate(publishedDate)}</p>
                            ${source.url && source.url !== '#' ? 
                              `<a href="${source.url}" target="_blank" class="btn btn-sm btn-outline-primary">View Source</a>` : 
                              '<span class="text-muted small">No source link available</span>'}
                        </div>
                    `;
                });
                matchedSources.innerHTML = sourcesHtml;
                
                // Trigger animations for sources
                setTimeout(() => {
                    const sourceElements = document.querySelectorAll('.matched-source');
                    sourceElements.forEach(element => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    });
                }, 100);
            } else {
                matchedSources.innerHTML = '<p class="text-muted fst-italic">No matching sources found.</p>';
            }
            
            // Show results
            resultsContent.classList.remove('d-none');
            noResults.classList.add('d-none');
            
            // Update share button to visible and enable it
            const shareResultsBtn = document.getElementById('shareResultsBtn');
            if (shareResultsBtn) {
                shareResultsBtn.style.display = 'flex';
                setupShareButton(); // Ensure share button functionality is set up
            }
        }, 100);
    }, 100);
}

// Function to handle sharing functionality
function setupShareButton() {
    const shareResultsBtn = document.getElementById('shareResultsBtn');
    if (!shareResultsBtn) return;
    
    // Check if modal exists, create it if not
    let shareModal = document.getElementById('shareModal');
    if (!shareModal) {
        // Create modal element if it doesn't exist yet
        const modalHTML = `
        <div class="modal fade" id="shareModal" tabindex="-1" aria-labelledby="shareModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="shareModalLabel">Share Verification Results</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h6 class="mb-3">Share via</h6>
                        <div class="d-flex flex-wrap justify-content-center gap-3 mb-4">
                            <a href="#" class="btn btn-outline-primary share-btn" data-platform="facebook">
                                <i class="bi bi-facebook me-2"></i>Facebook
                            </a>
                            <a href="#" class="btn btn-outline-info share-btn" data-platform="twitter">
                                <i class="bi bi-twitter-x me-2"></i>Twitter
                            </a>
                            <a href="#" class="btn btn-outline-success share-btn" data-platform="whatsapp">
                                <i class="bi bi-whatsapp me-2"></i>WhatsApp
                            </a>
                            <a href="#" class="btn btn-outline-danger share-btn" data-platform="gmail">
                                <i class="bi bi-envelope-fill me-2"></i>Email
                            </a>
                            <a href="#" class="btn btn-outline-info share-btn" data-platform="telegram">
                                <i class="bi bi-telegram me-2"></i>Telegram
                            </a>
                        </div>
                        <div class="mb-3">
                            <label for="shareUrl" class="form-label">Or copy this link</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="shareUrl" readonly>
                                <button class="btn btn-outline-secondary" type="button" id="copyShareUrl">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        
        // Append modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstChild);
        
        // Get the modal element
        shareModal = document.getElementById('shareModal');
    }
    
    // Initialize Bootstrap modal
    const modal = new bootstrap.Modal(shareModal);
    const shareUrl = document.getElementById('shareUrl');
    const copyShareUrl = document.getElementById('copyShareUrl');
    const shareButtons = document.querySelectorAll('.share-btn');
    
    // Create a unique share URL with result info
    function generateShareUrl() {
        // Create a URL with verification data encoded as parameters
        const category = document.getElementById('resultCategory').textContent;
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams();
        
        params.append('category', category);
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    // Handle the share button click
    shareResultsBtn.addEventListener('click', function() {
        const url = generateShareUrl();
        shareUrl.value = url;
        
        // Check if Web Share API is available
        if (navigator.share) {
            navigator.share({
                title: 'Verification Results from News Verifier',
                text: `This content has been marked as ${document.getElementById('resultCategory').textContent}`,
                url: url
            })
            .then(() => console.log('Shared successfully'))
            .catch((error) => {
                console.log('Error sharing:', error);
                // Fallback to modal if sharing fails
                modal.show();
            });
        } else {
            // Fallback for browsers without Web Share API
            modal.show();
        }
    });
    
    // Copy URL to clipboard
    if (copyShareUrl) {
        copyShareUrl.addEventListener('click', function() {
            shareUrl.select();
            document.execCommand('copy');
            
            // Show feedback
            const originalHTML = copyShareUrl.innerHTML;
            copyShareUrl.innerHTML = '<i class="bi bi-check"></i>';
            
            setTimeout(() => {
                copyShareUrl.innerHTML = originalHTML;
            }, 2000);
        });
    }
    
    // Handle share button clicks
    if (shareButtons) {
        shareButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const platform = this.getAttribute('data-platform');
                const url = encodeURIComponent(shareUrl.value);
                const text = encodeURIComponent(`Verification Results from News Verifier: This content has been marked as ${document.getElementById('resultCategory').textContent}`);
                
                let shareUrl;
                
                switch(platform) {
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                        break;
                    case 'whatsapp':
                        shareUrl = `https://wa.me/?text=${text}%20${url}`;
                        break;
                    case 'gmail':
                        shareUrl = `mailto:?subject=Verification%20Results&body=${text}%20${url}`;
                        break;
                    case 'telegram':
                        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
                        break;
                }
                
                if (shareUrl) {
                    window.open(shareUrl, '_blank');
                }
            });
        });
    }
}

// Helper Functions
function showLoading() {
    if (!resultsLoading || !resultsContent || !noResults) {
        console.error('Loading elements not found');
        return;
    }

    resultsLoading.classList.remove('d-none');
    resultsContent.classList.add('d-none');
    noResults.classList.add('d-none');
    
    // Add loading animation
    resultsLoading.style.opacity = '0';
    setTimeout(() => {
        resultsLoading.style.opacity = '1';
    }, 50);
}

function hideLoading() {
    if (!resultsLoading) {
        return;
    }

    resultsLoading.style.opacity = '0';
    setTimeout(() => {
        resultsLoading.classList.add('d-none');
    }, 300);
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

function getReliabilityClass(reliability) {
    switch (reliability.toLowerCase()) {
        case 'high':
            return 'reliability-high';
        case 'medium':
            return 'reliability-medium';
        case 'low':
            return 'reliability-low';
        default:
            return '';
    }
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString; // Return original string if there's an error
    }
}

// Create and show notification toast
function showNotification(message, type = 'info') {
    try {
        // First, check if toast container exists, if not create it
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.className = `toast show align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.setAttribute('id', toastId);
        
        // Create toast content
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Add toast to container
        toastContainer.appendChild(toast);
        
        // Initialize Bootstrap toast if available
        if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
            const bootstrapToast = new bootstrap.Toast(toast, {
                autohide: true,
                delay: 5000
            });
            
            // Show toast
            bootstrapToast.show();
        }
        
        // Fallback for showing/hiding if Bootstrap JS is not available
        setTimeout(() => {
            toast.remove();
        }, 5000);
        
        // Add click handler for close button
        const closeBtn = toast.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                toast.remove();
            });
        }
    } catch (error) {
        console.error('Error showing notification:', error);
        // Fallback to alert for critical messages
        if (type === 'danger') {
            alert(message);
        }
    }
}
