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
  Text,
  VStack,
  HStack,
  Box,
  useColorModeValue,
  IconButton,
  useToast,
  Heading,
  Checkbox,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import moment from 'moment';

const ExtendBooking = ({ isOpen, onClose, bookingData, authToken, onSuccess }) => {
  const [selectedDates, setSelectedDates] = useState({});
  const [selectedRooms, setSelectedRooms] = useState({});
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const highlightColor = useColorModeValue('blue.500', 'blue.300');

  useEffect(() => {
    if (bookingData) {
      const initialDates = {};
      const initialRooms = {};
      const bookings = Array.isArray(bookingData) ? bookingData : [bookingData];
      
      bookings.forEach(booking => {
        initialDates[booking.bookingId] = moment(booking.checkOut);
        initialRooms[booking.bookingId] = true;
      });
      
      setSelectedDates(initialDates);
      setSelectedRooms(initialRooms);
    }
  }, [bookingData]);

  const handleSave = async () => {
    const selectedBookings = Object.entries(selectedRooms)
      .filter(([_, isSelected]) => isSelected)
      .map(([bookingId, _]) => ({
        bookingId,
        dateString: selectedDates[bookingId].format('YYYY-MM-DD')
      }));

    try {
      const promises = selectedBookings.map(booking =>
        fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/edit?bookingId=${booking.bookingId}&dateString=${booking.dateString}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        })
      );

      const results = await Promise.all(promises);
      const failedBookings = results.filter(res => !res.ok);

      if (failedBookings.length === 0) {
        onSuccess('Bookings Updated Successfully!', selectedBookings);
        toast({
          title: 'Bookings Extended',
          description: 'Your selected bookings have been successfully extended.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onClose();
      } else {
        throw new Error(`Failed to update ${failedBookings.length} bookings`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDateChange = (bookingId, increment) => {
    setSelectedDates(prev => ({
      ...prev,
      [bookingId]: prev[bookingId].clone().add(increment, 'days')
    }));
  };

  const handleRoomSelection = (bookingId) => {
    setSelectedRooms(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const renderBookingItem = (booking) => {
    const bookingId = booking.bookingId;
    const minCheckoutDate = moment(booking.checkIn).add(1, 'days');
    const currentSelectedDate = selectedDates[bookingId];

    if (!currentSelectedDate) {
      return null; // Skip rendering if the date is not set
    }

    return (
      <Box key={bookingId} mb={4} p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
        <Flex justifyContent="space-between" alignItems="center" mb={2}>
          <Checkbox 
            isChecked={selectedRooms[bookingId]} 
            onChange={() => handleRoomSelection(bookingId)}
            colorScheme="blue"
          >
            <Text fontWeight="bold">Room {booking.roomNumber}</Text>
          </Checkbox>
          <Badge colorScheme={booking.roomType === 'AC' ? 'green' : 'blue'}>
            {booking.roomType}
          </Badge>
        </Flex>
        <Text fontSize="sm" mb={2}>Current Check-out: {moment(booking.checkOut).format('LL')}</Text>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="sm" fontWeight="medium">New Check-out:</Text>
          <HStack>
            <IconButton
              icon={<ChevronLeftIcon />}
              onClick={() => handleDateChange(bookingId, -1)}
              isDisabled={currentSelectedDate.isSameOrBefore(minCheckoutDate)}
              size="sm"
              aria-label="Decrease date"
            />
            <Text fontWeight="bold" color={highlightColor}>
              {currentSelectedDate.format('LL')}
            </Text>
            <IconButton
              icon={<ChevronRightIcon />}
              onClick={() => handleDateChange(bookingId, 1)}
              size="sm"
              aria-label="Increase date"
            />
          </HStack>
        </HStack>
      </Box>
    );
  };

  const bookings = Array.isArray(bookingData) ? bookingData : [bookingData];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={bgColor} color={textColor}>
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
          <Heading size="lg">Extend Booking</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {bookings.length > 1 && (
              <Text fontSize="md" fontWeight="medium">Select rooms to extend:</Text>
            )}
            {bookings.map(renderBookingItem)}
          </VStack>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button variant="ghost" mr={3} onClick={onClose}>
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

export default ExtendBooking;