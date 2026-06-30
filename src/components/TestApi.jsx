// src/components/TestAPI.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

const TestAPI = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/products/categories')
            .then(response => {
                console.log('✅ API Connected:', response.data);
                setData(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('❌ API Error:', err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    return (
        <div>
            <h3>API Test Results:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default TestAPI;