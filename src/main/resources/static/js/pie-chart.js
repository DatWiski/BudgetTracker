// Pie Chart Implementation for SubTracker Dashboard

let pieChart = null;
let otherCategoriesData = [];

// Initialize the pie chart when the page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('categoryPieChart')) {
        loadPieChartData();
    }
});

// Load pie chart data from the API
async function loadPieChartData() {
    try {
        const token = document.querySelector('meta[name="google-id-token"]').getAttribute('content');
        
        const response = await fetch('/api/categories/pie-chart-data', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load pie chart data');
        }
        
        const data = await response.json();
        renderPieChart(data);
        
    } catch (error) {
        console.error('Error loading pie chart data:', error);
        showErrorMessage('Failed to load chart data');
    }
}

// Render the pie chart using Chart.js
function renderPieChart(data) {
    const ctx = document.getElementById('categoryPieChart').getContext('2d');
    
    // Store other categories data for hover functionality
    otherCategoriesData = data.otherCategories || [];
    
    // Destroy existing chart if it exists
    if (pieChart) {
        pieChart.destroy();
    }
    
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: data.colors,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverBackgroundColor: data.colors.map(color => adjustColorBrightness(color, -20))
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const element = elements[0];
                    const label = pieChart.data.labels[element.index];
                    
                    // Show modal with other categories if "Other" slice is clicked
                    if (label === 'Other' && otherCategoriesData.length > 0) {
                        showOtherCategoriesModal();
                    }
                }
            },
            onHover: (event, elements) => {
                event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
            }
        }
    });
}

// Show modal with other categories
function showOtherCategoriesModal() {
    const modal = new bootstrap.Modal(document.getElementById('otherCategoriesModal'));
    const list = document.getElementById('otherCategoriesList');
    
    // Clear existing content
    list.innerHTML = '';
    
    // Add each category to the list
    otherCategoriesData.forEach(category => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = category;
        list.appendChild(listItem);
    });
    
    modal.show();
}

// Helper function to adjust color brightness
function adjustColorBrightness(color, amount) {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00ff) + amount;
    let b = (num & 0x0000ff) + amount;
    
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    
    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
}

// Show error message
function showErrorMessage(message) {
    const errorHtml = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', errorHtml);
    }
}

// Export functions for potential use by other scripts
window.pieChartUtils = {
    loadPieChartData,
    renderPieChart,
    showOtherCategoriesModal
}; 