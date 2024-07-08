import React from 'react';
import { Box, Heading, VStack, HStack, Text, Checkbox, Input, Button, useColorModeValue } from '@chakra-ui/react';

const TaskManagement = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  // Dummy data for demonstration
  const tasks = [
    { id: 1, description: 'Clean room 101', completed: false },
    { id: 2, description: 'Restock minibar in room 205', completed: true },
  ];

  return (
    <Box p={5} bg={bgColor} minHeight="100vh">
      <Heading color={textColor} mb={6}>Task Management</Heading>
      <VStack spacing={4} align="stretch">
        {tasks.map((task) => (
          <HStack key={task.id}>
            <Checkbox isChecked={task.completed} colorScheme="teal" />
            <Text color={textColor}>{task.description}</Text>
          </HStack>
        ))}
        <HStack>
          <Input placeholder="New task" />
          <Button colorScheme="teal">Add Task</Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default TaskManagement;