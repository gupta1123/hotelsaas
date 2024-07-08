import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    Text,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useColorModeValue,
    useToast
} from '@chakra-ui/react';

const EditAddons = ({ visible, onCancel, onSave, bookingId, authToken, addOns }) => {
    const [addOnQuantities, setAddOnQuantities] = useState({});
    const toast = useToast();

    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    useEffect(() => {
        if (addOns) {
            setAddOnQuantities(addOns);
        }
    }, [addOns]);

    const handleQuantityChange = (addon, value) => {
        setAddOnQuantities(prev => ({...prev, [addon]: value}));
    };

    const handleSave = async () => {
        const addOnsArray = Object.entries(addOnQuantities).map(([name, qty]) => ({
            name: name.toLowerCase(),
            qty: qty
        }));

        try {
            const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/addAddOns?bookingId=${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(addOnsArray),
            });

            if (!response.ok) {
                throw new Error('Failed to update add-ons');
            }

            onSave(addOnQuantities);
            onCancel();
            toast({
                title: "Success",
                description: "Add-ons updated successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error updating add-ons:', error);
            toast({
                title: "Error",
                description: "Failed to update add-ons",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={visible} onClose={onCancel}>
            <ModalOverlay />
            <ModalContent bg={bgColor} color={textColor}>
                <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>Edit Add-ons</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {Object.entries(addOnQuantities).map(([addon, quantity]) => (
                            <HStack key={addon} justifyContent="space-between">
                                <Text>{addon.charAt(0).toUpperCase() + addon.slice(1)}</Text>
                                <NumberInput
                                    value={quantity}
                                    onChange={(valueString) => handleQuantityChange(addon, parseInt(valueString) || 0)}
                                    min={0}
                                    max={10}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </HStack>
                        ))}
                    </VStack>
                </ModalBody>
                <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
                    <Button variant="ghost" mr={3} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleSave}>
                        Save Changes
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditAddons;