import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Text,
    useToast,
} from '@chakra-ui/react';
import axios from 'axios';

const AddTransaction = ({ bookingId, authToken, onTransactionsUpdated }) => {
    const [amount, setAmount] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [pendingAmount, setPendingAmount] = useState(0);
    const toast = useToast();

    useEffect(() => {
        fetchTransactions();
    }, [bookingId, authToken]);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/getByBookingId?bookingId=${bookingId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            if (Array.isArray(response.data)) {
                setTransactions(response.data);
                const totalPaid = response.data.reduce((sum, transaction) => sum + transaction.amount, 0);
                setPendingAmount(response.data[0]?.pendingAmount || 0);
            } else {
                console.error('Received non-array data:', response.data);
                setTransactions([]);
                setPendingAmount(0);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
            setPendingAmount(0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/add',
                { bookingId, amount: parseFloat(amount) },
                { headers: { 'Authorization': `Bearer ${authToken}` } }
            );
            if (response.status === 200) {
                toast({
                    title: 'Transaction added successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                setAmount('');
                fetchTransactions();
                onTransactionsUpdated(pendingAmount - parseFloat(amount));
            }
        } catch (error) {
            toast({
                title: 'Error adding transaction',
                description: error.response?.data?.message || 'An error occurred',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box>
            <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                    <FormControl>
                        <FormLabel>Amount</FormLabel>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                        />
                    </FormControl>
                    <Button type="submit" colorScheme="blue">
                        Add Transaction
                    </Button>
                </VStack>
            </form>
            <Box mt={4}>
                <Text fontWeight="bold">Pending Amount: ₹{pendingAmount.toFixed(2)}</Text>
                <Text fontWeight="bold" mt={2}>Transaction History:</Text>
                {Array.isArray(transactions) && transactions.length > 0 ? (
                    transactions.map((transaction, index) => (
                        <Text key={index}>
                            ₹{transaction.amount.toFixed(2)} - {new Date(transaction.date).toLocaleString()}
                        </Text>
                    ))
                ) : (
                    <Text>No transactions found</Text>
                )}
            </Box>
        </Box>
    );
};

export default AddTransaction;