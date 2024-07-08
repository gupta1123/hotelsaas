import React, { useState } from 'react';
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
    Radio,
    RadioGroup,
    Textarea,
    useColorModeValue,
    useToast
} from '@chakra-ui/react';

const CancelDeleteBookingModal = ({ visible, onCancel, onConfirm, bookings, groupId, authToken }) => {
    const [action, setAction] = useState('cancel');
    const [reason, setReason] = useState('');
    const toast = useToast();

    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    const isGroupBooking = !!groupId;
    const bookingId = isGroupBooking ? null : bookings;

    const handleConfirm = async () => {
        if (action === 'cancel' && !reason.trim()) {
            toast({
                title: "Error",
                description: "Please provide a reason for cancellation",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!bookingId && !groupId) {
            toast({
                title: "Error",
                description: "No valid booking or group ID found",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            let url, method, body;
            if (action === 'cancel') {
                url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/cancel?${isGroupBooking ? `groupId=${groupId}` : `bookingId=${bookingId}`}`;
                method = 'PUT';
                body = JSON.stringify({ reason });
            } else {
                url = isGroupBooking
                    ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/deleteGroup?groupId=${groupId}`
                    : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/delete?bookingId=${bookingId}`;
                method = 'DELETE';
            }

            console.log(`Sending request to: ${url}`);
            console.log(`Method: ${method}`);
            console.log(`Body: ${body}`);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body,
            });

            if (!response.ok) {
                throw new Error('Failed to process the request');
            }

            toast({
                title: "Success",
                description: `${isGroupBooking ? 'Group booking' : 'Booking'} ${action === 'cancel' ? 'cancelled' : 'deleted'} successfully`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onConfirm();
        } catch (error) {
            console.error(`Error ${action}ing booking:`, error);
            toast({
                title: "Error",
                description: `Failed to ${action} ${isGroupBooking ? 'group booking' : 'booking'}`,
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
                <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
                    Cancel or Delete {isGroupBooking ? 'Group Booking' : 'Booking'}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <RadioGroup onChange={setAction} value={action}>
                            <VStack align="start">
                                <Radio value="cancel">Cancel {isGroupBooking ? 'Group Booking' : 'Booking'}</Radio>
                                <Radio value="delete">Delete {isGroupBooking ? 'Group Booking' : 'Booking'}</Radio>
                            </VStack>
                        </RadioGroup>
                        {action === 'cancel' && (
                            <Textarea
                                placeholder="Reason for cancellation"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
                    <Button variant="ghost" mr={3} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button colorScheme={action === 'cancel' ? 'yellow' : 'red'} onClick={handleConfirm}>
                        Confirm {action === 'cancel' ? 'Cancellation' : 'Deletion'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CancelDeleteBookingModal;