import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const SendEmailButton = () => {
  const sendEmail = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/send-csv`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    }
  };

  return (
    <button
      onClick={sendEmail}
      style={{
        backgroundColor: '#007bff',
        color: '#ffffff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease',
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
      onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
    >
      Mail your Data 
    </button>
  );
};

export default SendEmailButton;
