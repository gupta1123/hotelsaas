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
    Select,
    RadioGroup,
    Radio,
    VStack,
    HStack,
    Text,
    useColorModeValue,
    useToast
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const ChangeRoom = ({ visible, onCancel, onOk, checkInDate, checkInTime, checkOutDate, checkOutTime, authToken, bookingId, onRoomChanged }) => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [pricingToggle, setPricingToggle] = useState('');
    const toast = useToast();

    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    useEffect(() => {
        const fetchAvailableRooms = async () => {
            if (!checkInDate || !checkInTime || !checkOutDate || !checkOutTime) {
                console.error('Missing date or time parameters');
                return;
            }
            try {
                const response = await fetch(
                    `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/getVacantBetween?checkInDate=${checkInDate}&checkInTime=${checkInTime}&checkOutDate=${checkOutDate}&checkOutTime=${checkOutTime}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch available rooms');
                }
                const data = await response.json();
                setAvailableRooms(data);
            } catch (error) {
                console.error('Error fetching available rooms:', error);
                toast({
                    title: "Error",
                    description: "Failed to fetch available rooms",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        };

        if (visible) {
            fetchAvailableRooms();
        }
    }, [checkInDate, checkInTime, checkOutDate, checkOutTime, authToken, visible, toast]);

    const handleRoomChange = (value) => {
        setSelectedRoom(value);
    };

    const handlePricingToggleChange = (value) => {
        setPricingToggle(value);
    };

    const handleOk = async () => {
        if (!selectedRoom) {
            toast({
                title: "Error",
                description: "Please select a room",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

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

        const url = pricingToggle
            ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/editRoom?bookingId=${bookingId}&roomNumber=${selectedRoom}&toggleValue=${pricingToggle}`
            : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/editRoom?bookingId=${bookingId}&roomNumber=${selectedRoom}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (response.ok) {
                onOk();
                onCancel();
                onRoomChanged(selectedRoom);
                toast({
                    title: "Success",
                    description: `Room changed to ${selectedRoom}${pricingToggle ? ` with ${pricingToggle} pricing` : ''}`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                throw new Error('Failed to change room');
            }
        } catch (error) {
            console.error('Error changing room:', error);
            toast({
                title: "Error",
                description: "Failed to change room",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const MotionRadio = motion(Radio);

    return (
        <Modal isOpen={visible} onClose={onCancel}>
            <ModalOverlay />
            <ModalContent bg={bgColor} color={textColor}>
                <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>Change Room</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Select
                            placeholder="Select a room"
                            onChange={(e) => handleRoomChange(e.target.value)}
                        >
                            {availableRooms.map((room) => (
                                <option key={room.room} value={room.room}>
                                    {`Room ${room.room} - ${room.roomType} - Floor ${room.floor}`}
                                </option>
                            ))}
                        </Select>
                        <Text fontWeight="bold">Room Pricing Toggle</Text>
                        <RadioGroup onChange={handlePricingToggleChange} value={pricingToggle}>
                            <HStack spacing={4}>
                                <MotionRadio value="AC" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    AC
                                </MotionRadio>
                                <MotionRadio value="Non AC" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    Non AC
                                </MotionRadio>
                                <MotionRadio value="Deluxe" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    Deluxe
                                </MotionRadio>
                            </HStack>
                        </RadioGroup>
                    </VStack>
                </ModalBody>
                <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
                    <Button variant="ghost" mr={3} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleOk}>
                        Change Room
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ChangeRoom;