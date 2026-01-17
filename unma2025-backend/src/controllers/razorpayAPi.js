import axios from 'axios';

const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');   

export const getAccountBalance = async () => {
    try {
    
        const response = await axios.get('https://api.razorpay.com/v1/balance', {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            }
        });


        return response.data;
    } catch (error) {
        console.error('Error fetching account balance:', error);
        throw error;
    }
};







