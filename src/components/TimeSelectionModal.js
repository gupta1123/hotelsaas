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
  Flex,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Switch,
  useColorModeValue,
  Input,
  VStack,
} from '@chakra-ui/react';
import moment from 'moment';

const TimeSelectionModal = ({ isOpen, onClose, onTimeSelected }) => {
  const currentHour = moment().hour();
  const currentMinute = moment().minute();
  const isCurrentAM = currentHour < 12;

  const [hours, setHours] = useState(isCurrentAM ? currentHour : currentHour - 12);
  const [minutes, setMinutes] = useState(currentMinute);
  const [isAM, setIsAM] = useState(isCurrentAM);
  const [currentTime, setCurrentTime] = useState(moment().format('hh:mm A'));
  const [checkOutDate, setCheckOutDate] = useState(moment().add(1, 'days').format('YYYY-MM-DD'));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format('hh:mm A'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleHoursChange = (value) => setHours(parseInt(value));
  const handleMinutesChange = (value) => setMinutes(parseInt(value));
  const handleFormatChange = () => setIsAM(!isAM);


  const handleSubmit = () => {
    let formattedHours = isAM ? hours : (hours % 12) + 12;
    if (formattedHours === 24) formattedHours = 0; // Handle midnight case
    const formattedTime = `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    //onTimeSelected(formattedTime);
    onTimeSelected(formattedTime, checkOutDate);

    onClose();
    console.log('formattedTime', formattedTime)
    console.log('checkOutDate:', checkOutDate);

};


  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('black', 'white');
  const datePickerBgColor = useColorModeValue('white', '#2D3748');
  const datePickerColor = useColorModeValue('black', 'white');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Check-in Time</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4} textAlign="center" bg={bgColor} p={2} borderRadius="md">
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Current Time: {currentTime}
            </Text>
          </Box>
          <VStack spacing={4}>
            <Flex align="center" justify="center">
              <NumberInput
                value={hours}
                min={1}
                max={12}
                keepWithinRange={true}
                clampValueOnBlur={true}
                onChange={handleHoursChange}
                mr={2}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text mx={2}>:</Text>
              <NumberInput
                value={minutes}
                min={0}
                max={59}
                keepWithinRange={true}
                clampValueOnBlur={true}
                onChange={handleMinutesChange}
                mr={2}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Box ml={2}>
                <Switch isChecked={!isAM} onChange={handleFormatChange} />
                <Text ml={2}>{isAM ? 'AM' : 'PM'}</Text>
              </Box>
            </Flex>
            <Box>
              <Text fontSize="md" fontWeight="bold" color={textColor} mb={2}>
                Select Check-out Date
              </Text>
              <Input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                bg={datePickerBgColor}
                color={datePickerColor}
                size="sm"
              />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Confirm
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TimeSelectionModal;