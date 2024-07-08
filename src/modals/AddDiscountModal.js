import React, { useState } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, FormControl, FormLabel, NumberInput, NumberInputField, NumberInputStepper,
    NumberIncrementStepper, NumberDecrementStepper, VStack, useColorModeValue, useToast
} from '@chakra-ui/react';

const AddDiscountModal = ({ visible, onCancel, onSave, bookingId, authToken }) => {
    const [discount, setDiscount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    const handleSave = async () => {
        if (!bookingId) {
            toast({
                title: "Error",
                description: "Booking ID is missing",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/updateDiscount?discount=${discount}&bookingId=${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to add discount');
            }

            toast({
                title: "Success",
                description: `Discount of ₹${discount} added successfully`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onSave(discount);
        } catch (error) {
            console.error('Error adding discount:', error);
            toast({
                title: "Error",
                description: "Failed to add discount",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={visible} onClose={onCancel}>
            <ModalOverlay />
            <ModalContent bg={bgColor} color={textColor}>
                <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>Add Discount</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>Discount Amount (₹)</FormLabel>
                            <NumberInput min={0} value={discount} onChange={(value) => setDiscount(Number(value))}>
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
                    <Button variant="ghost" mr={3} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleSave} isLoading={isLoading}>
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddDiscountModal;
