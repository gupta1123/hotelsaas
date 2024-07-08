import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    HStack,
    Text,
    useToast,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    useColorModeValue,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Select,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import moment from 'moment';

const UnifiedTransactionComponent = ({ bookingId, groupId, authToken, onTransactionsUpdated }) => {
    const [transactions, setTransactions] = useState([]);
    const [pendingAmount, setPendingAmount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const { register, handleSubmit, reset, setValue } = useForm({
        defaultValues: {
            date: moment().format('YYYY-MM-DD'),
            paymentMode: 'upi'
        }
    });
    const toast = useToast();

    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');

    const fetchTransactions = useCallback(async () => {
        try {
            let url = groupId
                ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllGroupTransactions?groupId=${groupId}`
                : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllTransactions?bookingId=${bookingId}`;

            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });

            if (Array.isArray(response.data)) {
                setTransactions(response.data);
                const totalPaid = response.data.reduce((sum, transaction) => sum + transaction.amountPaid, 0);
                setPendingAmount(response.data[0]?.pendingAmount || 0);
                return response.data;
            } else {
                console.error('Received non-array data:', response.data);
                setTransactions([]);
                setPendingAmount(0);
                return [];
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
            setPendingAmount(0);
            return [];
        }
    }, [bookingId, groupId, authToken]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);


    const handleAddTransaction = async (data) => {
        try {
            const url = groupId
                ? 'http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/createForGroup'
                : 'http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/create';

            const payload = groupId
                ? {
                    amountPaid: parseFloat(data.amount),
                    date: moment(data.date).format('YYYY-MM-DD'),
                    paymentMode: data.paymentMode,
                    groupId
                }
                : {
                    amountPaid: data.amount,
                    bookingId,
                    date: moment(data.date).format('YYYY-MM-DD'),
                    paymentMode: data.paymentMode
                };

            const response = await axios.put(url, payload, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                toast({
                    title: 'Transaction added successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                // const updatedTransactions = await fetchTransactions();
                // onTransactionsUpdated(updatedTransactions);
                onTransactionsUpdated(); // Notify parent component
                setIsModalOpen(false);
                setIsModalOpen(false);
                reset({
                    date: moment().format('YYYY-MM-DD'),
                    paymentMode: 'upi'
                });
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


    const handleEditTransaction = async (data) => {
        try {
            const url = groupId
                ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/editForGroup?groupId=${groupId}&transactionId=${editingTransaction.transactionId}`
                : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/edit?bookingId=${bookingId}&transactionId=${editingTransaction.transactionId}`;
            const payload = {
                amountPaid: parseFloat(data.amount),
                date: moment(data.date).format('YYYY-MM-DD'),
                paymentMode: data.paymentMode,
                ...(groupId ? { groupId } : { bookingId }),
            };

            const response = await axios.put(url, payload, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                toast({
                    title: 'Transaction updated successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                const updatedTransactions = await fetchTransactions();
                // onTransactionsUpdated(updatedTransactions);
                // setIsModalOpen(false);
                // setEditingTransaction(null);
                // reset();
                onTransactionsUpdated(); // Notify parent component
                setIsModalOpen(false);
                setEditingTransaction(null);
                reset();
            }
        } catch (error) {
            toast({
                title: 'Error updating transaction',
                description: error.response?.data?.message || 'An error occurred',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };


    const handleDeleteTransaction = async (transactionId) => {
        try {
            const url = groupId
                ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/deleteFromGroup?transactionId=${transactionId}&groupId=${groupId}`
                : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/delete?transactionId=${transactionId}&bookingId=${bookingId}`;

            const response = await axios.delete(url, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });

            if (response.status === 200) {
                toast({
                    title: 'Transaction deleted successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                const updatedTransactions = await fetchTransactions();
                onTransactionsUpdated(updatedTransactions);
            }
        } catch (error) {
            toast({
                title: 'Error deleting transaction',
                description: error.response?.data?.message || 'An error occurred',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const openModal = (transaction = null) => {
        if (transaction) {
            setEditingTransaction(transaction);
            setValue('date', moment(transaction.date).format('YYYY-MM-DD'));
            setValue('amount', transaction.amountPaid);
            setValue('paymentMode', transaction.paymentMode);
        } else {
            setEditingTransaction(null);
            reset({
                date: moment().format('YYYY-MM-DD'),
                paymentMode: 'upi'
            });
        }
        setIsModalOpen(true);
    };

    return (
        <Box bg={bgColor} p={5} borderRadius="md" boxShadow="md">
            <VStack spacing={4} align="stretch">
                <HStack justifyContent="space-between">
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        Transactions
                    </Text>
                    <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => openModal()}>
                        Add Transaction
                    </Button>
                </HStack>
                <Text fontWeight="bold" color={textColor}>
                    Pending Amount: ₹{pendingAmount.toFixed(2)}
                </Text>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Date</Th>
                            <Th>Amount</Th>
                            <Th>Payment Mode</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {transactions.map((transaction) => (
                            <Tr key={transaction.transactionId}>
                                <Td>{moment(transaction.date).format('YYYY-MM-DD')}</Td>
                                <Td>₹{transaction.amountPaid.toFixed(2)}</Td>
                                <Td>{transaction.paymentMode}</Td>
                                <Td>
                                    <HStack spacing={2}>
                                        <IconButton
                                            icon={<EditIcon />}
                                            size="sm"
                                            onClick={() => openModal(transaction)}
                                            aria-label="Edit transaction"
                                        />
                                        <IconButton
                                            icon={<DeleteIcon />}
                                            size="sm"
                                            onClick={() => handleDeleteTransaction(transaction.transactionId)}
                                            aria-label="Delete transaction"
                                        />
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </VStack>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</ModalHeader>
                    <ModalCloseButton />
                    <form onSubmit={handleSubmit(editingTransaction ? handleEditTransaction : handleAddTransaction)}>
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Date</FormLabel>
                                    <Input type="date" {...register('date', { required: true })} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Amount</FormLabel>
                                    <Input type="number" step="0.01" {...register('amount', { required: true, min: 0 })} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Payment Mode</FormLabel>
                                    <Select {...register('paymentMode', { required: true })}>
                                        <option value="upi">UPI</option>
                                        <option value="online">Online</option>
                                        <option value="cash">Cash</option>
                                        <option value="creditCard">Credit Card</option>
                                    </Select>
                                </FormControl>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button type="submit" colorScheme="blue" mr={3}>
                                {editingTransaction ? 'Update' : 'Add'}
                            </Button>
                            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default UnifiedTransactionComponent;