import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Icon,
  Flex,
  Spacer,
  useColorModeValue,
  Badge,
  Grid,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { FaUsers, FaTasks, FaCalendarCheck, FaDoorClosed, FaExclamationCircle, FaRedo, FaCheckCircle } from 'react-icons/fa';
import moment from 'moment';

const Housekeeping = ({ authToken }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({ room: '', status: '', priority: '' });
  const [roomOptions, setRoomOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const bg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [authToken]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/getAll", {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      setTasks(data);
      setFilteredTasks(data);

      // Extract unique room numbers and sort them in ascending order
      const roomNumbers = [...new Set(data.map(task => task.roomNumber))];
      const sortedRoomNumbers = roomNumbers.sort((a, b) => a - b);
      setRoomOptions(sortedRoomNumbers);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const filtered = tasks.filter(task => 
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true; // If no filter value, include all
        if (key === 'room') {
          return task.roomNumber?.toString() === value;
        }
        return task[key]?.toString().toLowerCase().includes(value.toLowerCase());
      })
    );
    setFilteredTasks(filtered);
  }, [filters, tasks]);

  const renderSkeletonTaskCard = () => (
    <Box p={4} mb={4} borderRadius="lg" boxShadow="md">
      <Flex alignItems="center" mb={3}>
        <Skeleton height="24px" width="150px" />
        <Spacer />
        <Skeleton height="20px" width="60px" mr={2} />
        <Skeleton height="20px" width="80px" />
      </Flex>
      <SkeletonText mt="2" noOfLines={4} spacing="4" />
      <Flex justifyContent="space-between" mt={3}>
        <Skeleton height="32px" width="100px" />
        <Skeleton height="32px" width="120px" />
      </Flex>
    </Box>
  );


  const handlePriorityChange = async (taskId, newPriority) => {
    try {
      const task = tasks.find(t => t.taskId === taskId);
      const currentDate = new Date().toISOString().split("T")[0];
      const requestBody = {
        roomNumber: task.roomNumber,
        status: task.status || "Assigned",
        priority: newPriority || "Low",
        date: currentDate || null,
      };

      const response = await fetch(
        `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/editTask?taskId=${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        setTasks(tasks.map(t => t.taskId === taskId ? { ...t, priority: newPriority } : t));
      } else {
        console.error("Failed to update task priority");
      }
    } catch (error) {
      console.error("Error updating task priority:", error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.taskId === taskId);
      const currentDate = new Date().toISOString().split("T")[0];
      const requestBody = {
        roomNumber: task.roomNumber,
        status: newStatus,
        priority: task.priority,
        date: currentDate,
      };
  
      const response = await fetch(
        `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/editTask?taskId=${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(requestBody),
        }
      );
  
      if (response.ok) {
        setTasks(tasks.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));
      } else {
        console.error("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusOrder = ['Assigned', 'Work in Progress', 'Completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return statusOrder[(currentIndex + 1) % statusOrder.length];
  };

  const renderTaskCard = (task) => (
    <Box
      bg={bg}
      borderRadius="lg"
      boxShadow="md"
      p={4}
      mb={4}
      key={task.taskId}
      borderLeft={`8px solid ${getPriorityColor(task.priority)}`}
      transition="all 0.3s"
      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
    >
      <Flex alignItems="center" mb={3}>
        <Heading size="md" color={textColor}>
          Room {task.roomNumber}
          {task.customerName && (
            <Badge ml={2} colorScheme="green">Occupied</Badge>
          )}
          {!task.customerName && (
            <Badge ml={2} colorScheme="gray">Vacant</Badge>
          )}
        </Heading>
        <Spacer />
        <Badge colorScheme={getPriorityColorScheme(task.priority)} mr={2}>{task.priority}</Badge>
        <Badge colorScheme={getStatusColorScheme(task.status)}>{task.status}</Badge>
      </Flex>
      {task.customerName && (
        <Text color={textColor} fontWeight="medium" mb={2}>{task.customerName}</Text>
      )}
      <Grid templateColumns="repeat(2, 1fr)" gap={3} mb={3}>
        <HStack>
          <Icon as={FaUsers} color="gray.500" />
          <Text color={textColor} fontSize="sm">{task.guestCount} Guests</Text>
        </HStack>
        <HStack>
          <Icon as={FaCalendarCheck} color="gray.500" />
          <Text color={textColor} fontSize="sm">Check Out: {moment(task.checkOutTime, "HH:mm:ss").format("h:mm A")}</Text>
        </HStack>
      </Grid>
      <Flex justifyContent="space-between" mt={3}>
        <Popover>
          <PopoverTrigger>
            <Button size="sm" leftIcon={<FaExclamationCircle />} colorScheme={getPriorityColorScheme(task.priority)}>
              Priority
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody>
              <VStack align="stretch" spacing={2}>
                <Button size="sm" onClick={() => handlePriorityChange(task.taskId, 'High')} colorScheme="red">High</Button>
                <Button size="sm" onClick={() => handlePriorityChange(task.taskId, 'Medium')} colorScheme="orange">Medium</Button>
                <Button size="sm" onClick={() => handlePriorityChange(task.taskId, 'Low')} colorScheme="green">Low</Button>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
        {task.status === 'Assigned' && (
          <Button 
            size="sm"
            colorScheme="yellow"
            onClick={() => handleStatusChange(task.taskId, 'Work in Progress')}
          >
            Start Work
          </Button>
        )}
        {task.status === 'Work in Progress' && (
          <Button 
            size="sm"
            colorScheme="green"
            onClick={() => handleStatusChange(task.taskId, 'Completed')}
          >
            Mark as Done
          </Button>
        )}
        {task.status === 'Completed' && (
          <Button 
            size="sm"
            colorScheme="blue"
            onClick={() => handleStatusChange(task.taskId, 'Assigned')}
          >
            Reopen
          </Button>
        )}
      </Flex>
    </Box>
  );

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'red.500';
      case 'medium': return 'orange.500';
      case 'low': return 'green.500';
      default: return 'gray.500';
    }
  };

  const getPriorityColorScheme = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColorScheme = (status) => {
    switch (status.toLowerCase()) {
      case 'assigned': return 'blue';
      case 'work in progress': return 'yellow';
      case 'completed': return 'green';
      default: return 'gray';
    }
  };

  const priorityOrder = { High: 1, Medium: 2, Low: 3 };

  const activeTasks = filteredTasks.filter((task) => task.status !== "Completed");
  const closedTasks = filteredTasks.filter((task) => task.status === "Completed");

  return (
    <Box minHeight="100vh" p={5}>
      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={3} spacing={4}>
          <Select
            placeholder="Select Room"
            value={filters.room}
            onChange={(e) => setFilters({...filters, room: e.target.value})}
          >
            {roomOptions.map((room) => (
              <option key={room} value={room}>Room {room}</option>
            ))}
          </Select>
          <Select
            placeholder="Status"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="Assigned">Assigned</option>
            <option value="Work in Progress">Work in Progress</option>
            <option value="Completed">Completed</option>
          </Select>
          <Select
            placeholder="Priority"
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>
        </SimpleGrid>
        <Tabs>
          <TabList>
            <Tab>Active</Tab>
            <Tab>Closed</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={2} spacing={6}>
                <Box>
                  <Heading size="md" mb={4}>Room Service Tasks</Heading>
                  {isLoading ? (
                    Array(3).fill(0).map((_, index) => renderSkeletonTaskCard())
                  ) : (
                    activeTasks
                      .filter(task => task.taskName === 'Room Service')
                      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
                      .map(task => renderTaskCard(task))
                  )}
                </Box>
                <Box>
                  <Heading size="md" mb={4}>Cleaning Tasks</Heading>
                  {isLoading ? (
                    Array(3).fill(0).map((_, index) => renderSkeletonTaskCard())
                  ) : (
                    activeTasks
                      .filter(task => task.taskName === 'Cleaning')
                      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
                      .map(task => renderTaskCard(task))
                  )}
                </Box>
              </SimpleGrid>
            </TabPanel>
            <TabPanel>
              <SimpleGrid columns={2} spacing={6}>
                <Box>
                  <Heading size="md" mb={4}>Closed Room Service Tasks</Heading>
                  {isLoading ? (
                    Array(3).fill(0).map((_, index) => renderSkeletonTaskCard())
                  ) : (
                    closedTasks
                      .filter(task => task.taskName === 'Room Service')
                      .map(task => renderTaskCard(task))
                  )}
                </Box>
                <Box>
                  <Heading size="md" mb={4}>Closed Cleaning Tasks</Heading>
                  {isLoading ? (
                    Array(3).fill(0).map((_, index) => renderSkeletonTaskCard())
                  ) : (
                    closedTasks
                      .filter(task => task.taskName === 'Cleaning')
                      .map(task => renderTaskCard(task))
                  )}
                </Box>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default Housekeeping;