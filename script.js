
const STORAGE_KEY = 'train_bookings';


const ticketPrices = {
    'Москва - Санкт-Петербург': 2500,
    'Санкт-Петербург - Москва': 2500,
    'Москва - Казань': 3000,
    'Казань - Москва': 3000,
    'Москва - Сочи': 4500,
    'Сочи - Москва': 4500,
    'Москва - Екатеринбург': 4000,
    'Екатеринбург - Москва': 4000
};


const TOTAL_SEATS = 32;


function getStoredBookings() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

function saveBooking(direction, date, seats) {
    const bookings = getStoredBookings();
    const key = generateKey(direction, date);
    
    if (!bookings[key]) {
        bookings[key] = [];
    }
    
    
    bookings[key].push({
        id: Date.now(),
        seats: seats,
        totalPrice: seats.length * ticketPrices[direction],
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function getBookingsByDirectionAndDate(direction, date) {
    const bookings = getStoredBookings();
    const key = generateKey(direction, date);
    return bookings[key] || [];
}


function generateKey(direction, date) {
    return `${direction}_${date}`;
}


function getBookedSeats(direction, date) {
    const bookings = getBookingsByDirectionAndDate(direction, date);
    const bookedSeats = [];
    
    bookings.forEach(booking => {
        bookedSeats.push(...booking.seats);
    });
    
    return bookedSeats;
}

function renderCarriage(bookedSeats = [], selectedSeats = []) {
    const carriage = document.getElementById('carriage');
    carriage.innerHTML = '';
    
    for (let i = 1; i <= TOTAL_SEATS; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        
        if (bookedSeats.includes(i)) {
            seat.classList.add('booked');
        } else if (selectedSeats.includes(i)) {
            seat.classList.add('selected');
        } else {
            seat.classList.add('available');
        }
        
        seat.dataset.seatNumber = i;
        
        const seatNumber = document.createElement('div');
        seatNumber.className = 'seat-number';
        seatNumber.textContent = `Место ${i}`;
        
        seat.appendChild(seatNumber);
        
        if (!bookedSeats.includes(i)) {
            seat.addEventListener('click', () => toggleSeatSelection(i));
        }
        
        carriage.appendChild(seat);
    }
}

function toggleSeatSelection(seatNumber) {
    const direction = document.getElementById('direction').value;
    const date = document.getElementById('date').value;
    
    if (!date) {
        alert('Пожалуйста, выберите дату поездки');
        return;
    }
    
    const bookedSeats = getBookedSeats(direction, date);
    const selectedSeats = getSelectedSeats();
    
    if (bookedSeats.includes(seatNumber)) {
        return; 
    }
    
    const index = selectedSeats.indexOf(seatNumber);
    if (index === -1) {
        selectedSeats.push(seatNumber);
    } else {
        selectedSeats.splice(index, 1);
    }
    

    selectedSeats.sort((a, b) => a - b);
    

    renderCarriage(bookedSeats, selectedSeats);
    updateSelectedSeatsInfo(selectedSeats);
}

function getSelectedSeats() {
    const selected = [];
    document.querySelectorAll('.seat.selected').forEach(seat => {
        selected.push(parseInt(seat.dataset.seatNumber));
    });
    return selected;
}


function updateSelectedSeatsInfo(selectedSeats) {
    const selectedSeatsDiv = document.getElementById('selectedSeats');
    const totalPriceDiv = document.getElementById('totalPrice');
    const direction = document.getElementById('direction').value;
    
    selectedSeatsDiv.innerHTML = '';
    
    if (selectedSeats.length === 0) {
        selectedSeatsDiv.innerHTML = '<p style="opacity: 0.8;">Места не выбраны</p>';
        totalPriceDiv.textContent = 'Общая стоимость: 0 ₽';
        return;
    }
    
    selectedSeats.forEach(seat => {
        const badge = document.createElement('span');
        badge.className = 'selected-seat-badge';
        badge.textContent = `Место ${seat}`;
        selectedSeatsDiv.appendChild(badge);
    });
    
    const totalPrice = selectedSeats.length * ticketPrices[direction];
    totalPriceDiv.textContent = `Общая стоимость: ${totalPrice.toLocaleString()} ₽`;
}


function showSearchResults(bookings) {
    const modal = document.getElementById('searchModal');
    const resultsDiv = document.getElementById('searchResults');
    
    if (bookings.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results">❌ Бронирований не найдено</div>';
    } else {
        resultsDiv.innerHTML = '';
        bookings.forEach((booking, index) => {
            const card = document.createElement('div');
            card.className = 'booking-card';
            
            const date = new Date(booking.timestamp);
            const formattedDate = date.toLocaleString('ru-RU');
            
            const seatsList = booking.seats.map(seat => 
                `<span class="booking-seat">Место ${seat}</span>`
            ).join('');
            
            card.innerHTML = `
                <h4>Бронирование #${index + 1}</h4>
                <p>📅 Дата бронирования: ${formattedDate}</p>
                <p>🪑 Забронированные места:</p>
                <div class="booking-seats">${seatsList}</div>
                <p class="price">💰 Сумма: ${booking.totalPrice.toLocaleString()} ₽</p>
            `;
            
            resultsDiv.appendChild(card);
        });
    }
    
    modal.classList.add('show');
}


document.addEventListener('DOMContentLoaded', () => {
 
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
    
   
    renderCarriage();
    
    document.getElementById('searchBtn').addEventListener('click', () => {
        const direction = document.getElementById('direction').value;
        const date = document.getElementById('date').value;
        
        if (!date) {
            alert('Пожалуйста, выберите дату поездки');
            return;
        }
        
        const bookings = getBookingsByDirectionAndDate(direction, date);
        showSearchResults(bookings);
    });
    
 
    document.getElementById('bookBtn').addEventListener('click', () => {
        const direction = document.getElementById('direction').value;
        const date = document.getElementById('date').value;
        const selectedSeats = getSelectedSeats();
        
        if (!date) {
            alert('Пожалуйста, выберите дату поездки');
            return;
        }
        
        if (selectedSeats.length === 0) {
            alert('Пожалуйста, выберите места для бронирования');
            return;
        }
        
        
        const bookedSeats = getBookedSeats(direction, date);
        const alreadyBooked = selectedSeats.filter(seat => bookedSeats.includes(seat));
        
        if (alreadyBooked.length > 0) {
            alert(`Места ${alreadyBooked.join(', ')} уже забронированы. Пожалуйста, обновите страницу.`);
      
            renderCarriage(bookedSeats, []);
            return;
        }

        saveBooking(direction, date, selectedSeats);
        
        const totalPrice = selectedSeats.length * ticketPrices[direction];
        alert(`✅ Билеты успешно забронированы!\n\nНаправление: ${direction}\nДата: ${date}\nМеста: ${selectedSeats.join(', ')}\nСумма: ${totalPrice.toLocaleString()} ₽`);

        const updatedBookedSeats = getBookedSeats(direction, date);
        renderCarriage(updatedBookedSeats, []);
        updateSelectedSeatsInfo([]);
    });

    function updateSeatsForSelection() {
        const direction = document.getElementById('direction').value;
        const date = document.getElementById('date').value;
        
        if (date) {
            const bookedSeats = getBookedSeats(direction, date);
            renderCarriage(bookedSeats, []);
            updateSelectedSeatsInfo([]);
        }
    }
    
    document.getElementById('direction').addEventListener('change', updateSeatsForSelection);
    document.getElementById('date').addEventListener('change', updateSeatsForSelection);

    document.getElementById('closeSearchModal').addEventListener('click', () => {
        document.getElementById('searchModal').classList.remove('show');
    });
    
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('searchModal');
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

});