import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  useColorModeValue,
  Flex,
  Spacer,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
} from '@chakra-ui/react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';

// Utility function to capitalize names
const capitalizeName = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const Report = ({ authToken }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInPage, setCheckInPage] = useState(1);
  const [checkOutPage, setCheckOutPage] = useState(1);
  const [pageSize] = useState(5);
  const [dateRange, setDateRange] = useState('Today');
  const history = useHistory();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchData = async () => {
      try {
        let startDate, endDate;

        if (dateRange !== 'All') {
          switch (dateRange) {
            case 'Today':
              startDate = endDate = moment().format('YYYY-MM-DD');
              break;
            case 'Yesterday':
              startDate = endDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
              break;
            case 'Last 2 days':
              startDate = moment().subtract(2, 'days').format('YYYY-MM-DD');
              endDate = moment().format('YYYY-MM-DD');
              break;
            case 'This Month':
              startDate = moment().startOf('month').format('YYYY-MM-DD');
              endDate = moment().format('YYYY-MM-DD');
              break;
            case 'Last Month':
              startDate = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
              endDate = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
              break;
            default:
              startDate = endDate = moment().format('YYYY-MM-DD');
          }
        } else {
          startDate = moment().startOf('month').format('YYYY-MM-DD');
          endDate = moment().endOf('month').format('YYYY-MM-DD');
        }

        const response = await axios.get(
          `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getByRange?start=${startDate}&end=${endDate}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            },
          }
        );
        setBookings(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken, dateRange]);

  const aggregateBookings = (bookings) => {
    const grouped = {};

    bookings.forEach((booking) => {
      const key = booking.groupId ? `group-${booking.groupId}` : `single-${booking.bookingId}`;
      if (!grouped[key]) {
        grouped[key] = { ...booking, bookingIds: [booking.bookingId] };
      } else {
        grouped[key].bookingIds.push(booking.bookingId);
      }
    });

    return Object.values(grouped);
  };

  const processedBookings = aggregateBookings(bookings);

  const calculateKPIs = () => {
    const currentDate = new Date();
    const currentWeekStart = new Date(currentDate);
    currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const bookingsThisWeek = bookings.filter((booking) => new Date(booking.checkIn) >= currentWeekStart);
    const bookingsThisMonth = bookings.filter((booking) => new Date(booking.checkIn) >= currentMonthStart);

    const revenueThisWeek = bookingsThisWeek.reduce((total, booking) => total + booking.roomTotal, 0);
    const revenueThisMonth = bookingsThisMonth.reduce((total, booking) => total + booking.roomTotal, 0);

    const prevWeekStart = new Date(currentWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevMonthStart = new Date(currentMonthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

    const prevWeekBookings = bookings.filter((booking) => new Date(booking.checkIn) >= prevWeekStart && new Date(booking.checkIn) < currentWeekStart);
    const prevMonthBookings = bookings.filter((booking) => new Date(booking.checkIn) >= prevMonthStart && new Date(booking.checkIn) < currentMonthStart);

    const revenuePrevWeek = prevWeekBookings.reduce((total, booking) => total + booking.roomTotal, 0);
    const revenuePrevMonth = prevMonthBookings.reduce((total, booking) => total + booking.roomTotal, 0);

    const percentageChangeWeek = ((revenueThisWeek - revenuePrevWeek) / revenuePrevWeek) * 100;
    const percentageChangeMonth = ((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 100;

    return {
      revenueThisWeek,
      numBookingsThisWeek: bookingsThisWeek.length,
      revenueThisMonth,
      numBookingsThisMonth: bookingsThisMonth.length,
      percentageChangeWeek,
      percentageChangeMonth,
    };
  };

  const kpis = calculateKPIs();

  const renderDailyRevenueChart = () => {
    const revenueByDay = {};
    bookings.forEach((booking) => {
      const date = booking.checkIn.split('T')[0];
      if (!revenueByDay[date]) {
        revenueByDay[date] = booking.roomTotal;
      } else {
        revenueByDay[date] += booking.roomTotal;
      }
    });

    const data = Object.keys(revenueByDay).map((date) => ({
      date,
      revenue: revenueByDay[date],
    }));

    return (
      <Box bg={bgColor} p={4} borderRadius="md" boxShadow="md">
        <Heading size="md" mb={4}>Daily Revenue</Heading>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderRevenueDistributionChart = () => {
    const roomTypes = {};
    bookings.forEach((booking) => {
      roomTypes[booking.roomType] = roomTypes[booking.roomType]
        ? roomTypes[booking.roomType] + booking.roomTotal
        : booking.roomTotal;
    });

    const data = Object.keys(roomTypes).map((roomType) => ({
      roomType,
      revenue: roomTypes[roomType],
    }));

    return (
      <Box bg={bgColor} p={4} borderRadius="md" boxShadow="md">
        <Heading size="md" mb={4}>Revenue Distribution by Room Type</Heading>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="roomType" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const handleNavigation = (record) => {
    if (record.groupId) {
      history.push(`/group-booking/${record.groupId}`);
    } else {
      const bookingId = record.bookingIds && record.bookingIds.length > 0 ? record.bookingIds[0] : null;
      if (bookingId) {
        history.push(`/booking/${bookingId}`);
      } else {
        console.error('No booking ID found for the record:', record);
      }
    }
  };

  const paginatedBookings = (bookingsList, currentPage) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return bookingsList.slice(startIndex, endIndex);
  };

  const renderTable = (bookingsList, currentPage, setCurrentPage, title) => (
    <Box bg={bgColor} p={4} borderRadius="md" boxShadow="md">
      <Heading size="md" mb={4}>{title}</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Booking ID/Group ID</Th>
            <Th>Customer Name</Th>
            <Th>Room Number</Th>
            <Th>Room Type</Th>
            <Th>Check-in</Th>
            <Th>Check-out</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedBookings(bookingsList, currentPage).map((booking) => (
            <Tr key={booking.bookingId}>
              <Td>
                {booking.groupId ? (
                  <Tag colorScheme="blue">Group ID #{booking.groupId}</Tag>
                ) : (
                  <Tag colorScheme="green">Booking ID #{booking.bookingIds?.join(', ') || 'N/A'}</Tag>
                )}
              </Td>
              <Td>{capitalizeName(booking.customerName)}</Td>
              <Td>{booking.roomNumber}</Td>
              <Td>{booking.roomType}</Td>
              <Td>{moment(booking.checkIn).format('DD MMM YYYY')}</Td>
              <Td>{moment(booking.checkOut).format('DD MMM YYYY')}</Td>
              <Td>
                <Button colorScheme="blue" size="sm" onClick={() => handleNavigation(booking)}>View Details</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <HStack mt={4} justifyContent="space-between">
        <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
        <Text>Page {currentPage} of {Math.ceil(bookingsList.length / pageSize)}</Text>
        <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(bookingsList.length / pageSize)))} disabled={currentPage === Math.ceil(bookingsList.length / pageSize)}>Next</Button>
      </HStack>
    </Box>
  );

  return (
    <Box p={5} bg={useColorModeValue("gray.50", "gray.900")}>
      <VStack spacing={6} align="stretch">
        <Heading size="xl">Reports</Heading>

        <Tabs>
          <TabList>
            <Tab>KPIs</Tab>
            <Tab>Daybook</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Flex alignItems="center">
                  <Heading size="md">Key Performance Indicators</Heading>
                  <Spacer />
                  <Select
                    defaultValue="Today"
                    onChange={(e) => setDateRange(e.target.value)}
                    width="200px"
                  >
                    <option value="Today">Today</option>
                    <option value="Yesterday">Yesterday</option>
                    <option value="Last 2 days">Last 2 days</option>
                    <option value="This Month">This Month</option>
                    <option value="Last Month">Last Month</option>
                    <option value="All">All</option>
                  </Select>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                  <Box bg={bgColor} p={4} borderRadius="md" boxShadow="md">
                    <Heading size="md">Weekly Revenue</Heading>
                    <Text fontSize="2xl" fontWeight="bold">{kpis.revenueThisWeek.toFixed(2)}</Text>
                  </Box>
                  <Box bg={bgColor} p={4} borderRadius="md" boxShadow="md">
                    <Heading size="md">Weekly Bookings</Heading>
                    <Text fontSize="2xl" fontWeight="bold">{kpis.numBookingsThisWeek}</Text>
                  </Box>
                  <Box bg={bgColor} p={4} borderRadius="md" boxShadow="md">
                    <Heading size="md">Monthly Revenue</Heading>
                    <Text fontSize="2xl" fontWeight="bold">{kpis.revenueThisMonth.toFixed(2)}</Text>
                  </Box>
                  <Box bg={bgColor} p={4} borderRadius="md" boxShadow="md">
                    <Heading size="md">Monthly Bookings</Heading>
                    <Text fontSize="2xl" fontWeight="bold">{kpis.numBookingsThisMonth}</Text>
                  </Box>
                </SimpleGrid>
                {renderDailyRevenueChart()}
                {renderRevenueDistributionChart()}
              </VStack>
            </TabPanel>
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {renderTable(
                  processedBookings.filter((booking) => booking.checkIn === moment().format('YYYY-MM-DD')),
                  checkInPage,
                  setCheckInPage,
                  "Today's Check-ins"
                )}
                {renderTable(
                  processedBookings.filter((booking) => booking.checkOut === moment().format('YYYY-MM-DD')),
                  checkOutPage,
                  setCheckOutPage,
                  "Today's Check-outs"
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default Report;