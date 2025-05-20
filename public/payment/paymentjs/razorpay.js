document.getElementById('payment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = document.getElementById('amount').value * 100; // Convert to paise
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Create order on your server (you'll need to implement this endpoint)
    fetch('/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: amount,
            currency: 'INR'
        })
    })
    .then(response => response.json())
    .then(order => {
        const options = {
            key: 'rzp_test_CUrnOL4cJ4cUpK', // Your Razorpay Key ID
            amount: order.amount,
            currency: order.currency,
            name: 'Your Company Name',
            description: 'Payment for services',
            order_id: order.id,
            handler: function(response) {
                // Handle successful payment
                window.location.href = `/payment-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`;
            },
            prefill: {
                name: name,
                email: email,
                contact: phone
            },
            theme: {
                color: '#3399cc'
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error creating order. Please try again.');
    });
});