import React from 'react';
import { Box, Text, Badge, HStack, Button, useColorModeValue } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

const DueInNotification = ({ roomsData }) => {
  const history = useHistory();
  const bgColor = useColorModeValue("yellow.100", "yellow.700");
  const textColor = useColorModeValue("gray.800", "white");

  const getDueInRooms = () => {
    const currentTime = moment();
    return roomsData.filter((room) => {
      const { bookingId, checkIn, checkInTime, status, roomAvailabilityStatus } = room.first;
      return (
        bookingId &&
        status === "reserved" &&
        roomAvailabilityStatus === "reserved" &&
        moment(`${checkIn}T${checkInTime}`).isBefore(currentTime)
      );
    });
  };

  const dueInRooms = getDueInRooms();

  if (dueInRooms.length === 0) return null;

  return (
    <Box 
      bg={bgColor} 
      p={3} 
      borderRadius="md" 
      boxShadow="sm" 
      mb={4}
    >
      {dueInRooms.map((room, index) => (
        <HStack key={room.first.bookingId} justifyContent="space-between" alignItems="center">
          <HStack spacing={4}>
            <Badge colorScheme="red" fontSize="0.8em" p={1}>
              {index + 1}
            </Badge>
            <Text fontWeight="medium" color={textColor}>Guest Due In</Text>
            <Text color={textColor}>{room.first.customerName}</Text>
            <Text fontWeight="medium" color={textColor}>Room {room.first.room}</Text>
          </HStack>
          <Button 
            size="sm" 
            colorScheme="blue" 
            onClick={() => history.push(`/booking/${room.first.bookingId}`)}
          >
            View Booking
          </Button>
        </HStack>
      ))}
    </Box>
  );
};

export default DueInNotification;