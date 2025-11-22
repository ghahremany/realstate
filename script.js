// Initialize map - مختصات پیش‌فرض برای واوان
const map = L.map('map').setView([35.5155, 51.2230], 15);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// Store markers for later reference
const markers = {};

// Custom icon for markers
const customIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Format price in Toman
function formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
}

// Create popup content
function createPopupContent(property) {
    return `
        <div class="text-center" style="min-width: 200px;">
            <img src="${property.image_url}" alt="${property.title}" 
                 style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${property.title}</h3>
            <p style="color: #059669; font-weight: bold; font-size: 18px; margin-bottom: 5px;">${formatPrice(property.price)}</p>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">متراژ: ${property.area} متر مربع</p>
            <a href="${property.divar_link}" target="_blank" 
               style="display: inline-block; background-color: #ef4444; color: white; padding: 8px 16px; 
                      border-radius: 6px; text-decoration: none; font-size: 14px;">
                مشاهده در دیوار
            </a>
        </div>
    `;
}

// Create property card for sidebar
function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-xl transition-all';
    card.innerHTML = `
        <div class="flex gap-3">
            <img src="${property.image_url}" alt="${property.title}" 
                 class="w-24 h-24 object-cover rounded-lg">
            <div class="flex-1">
                <h3 class="font-bold text-lg text-gray-800 mb-1">${property.title}</h3>
                <p class="text-green-600 font-bold text-xl mb-1">${formatPrice(property.price)}</p>
                <p class="text-gray-600 text-sm">📏 ${property.area} متر مربع</p>
            </div>
        </div>
    `;
    
    // Add click event to focus on marker
    card.addEventListener('click', () => {
        map.setView([property.lat, property.lng], 16);
        markers[property.id].openPopup();
    });
    
    return card;
}

// Load properties from JSON
async function loadProperties() {
    try {
        const response = await fetch('data.json');
        const properties = await response.json();
        
        const propertyList = document.getElementById('property-list');
        propertyList.innerHTML = '';
        
        // Update property count
        document.getElementById('property-count').textContent = properties.length;
        
        // Add markers and cards for each property
        properties.forEach(property => {
            // Add marker to map
            const marker = L.marker([property.lat, property.lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(createPopupContent(property));
            
            markers[property.id] = marker;
            
            // Add card to sidebar
            propertyList.appendChild(createPropertyCard(property));
        });
        
        // Fit map to show all markers
        if (properties.length > 0) {
            const group = L.featureGroup(Object.values(markers));
            map.fitBounds(group.getBounds().pad(0.1));
        }
        
    } catch (error) {
        console.error('Error loading properties:', error);
        document.getElementById('property-list').innerHTML = `
            <div class="text-center py-8 text-red-500">
                <p class="text-lg font-bold">خطا در بارگذاری املاک</p>
                <p class="text-sm mt-2">لطفاً فایل data.json را در کنار index.html قرار دهید</p>
            </div>
        `;
    }
}

// Load properties when page loads
window.addEventListener('load', loadProperties);
